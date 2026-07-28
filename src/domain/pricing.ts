/**
 * Motor de precios — Forno
 *
 * Un único lugar donde se calcula plata. El Constructor, el carrito, el checkout y el
 * resumen del pedido llaman todos acá; así el número que ve el usuario en la barra fija
 * es literalmente el mismo que termina cobrándose. La sorpresa de precio al final
 * —el punto de fuga #1 de la investigación— suele nacer de tener dos cálculos distintos.
 *
 * Ya entiende mitades: `HALF_PRICE_FACTOR` se aplica a los ingredientes que van a un solo
 * lado. En la v1 nunca se ejerce, porque la interfaz solo emite `'whole'`.
 */

import {
  ADDONS,
  DELIVERY_FEE,
  FREE_DELIVERY_FROM,
  getAddon,
  getCrust,
  getPizza,
  getSize,
  getTopping,
} from './menu';
import type { CartLine, PizzaConfig, PizzaHalf } from './types';

/**
 * Un ingrediente en media pizza cuesta la mitad. Se cobra proporcional y no completo
 * porque cobrar el 100% por medio ingrediente es exactamente el tipo de sorpresa que
 * este diseño busca eliminar.
 */
const HALF_PRICE_FACTOR = 0.5;

const halfFactor = (half: PizzaHalf): number => (half === 'whole' ? 1 : HALF_PRICE_FACTOR);

/** Redondeo a $10. Evita totales con centavos que se ven descuidados en pantalla. */
const round = (value: number): number => Math.round(value / 10) * 10;

/** Desglose de una pizza configurada, línea por línea. Alimenta la UI del Constructor. */
export type PizzaPriceBreakdown = {
  /** Precio de la pizza en el tamaño elegido, con masa clásica. */
  base: number;
  /** Recargo de la masa. 0 si es clásica. */
  crust: number;
  /** Suma de los ingredientes extra, ya escalada por tamaño y por lado. */
  extras: number;
  /** Total de una unidad. */
  unit: number;
};

export function priceOfPizza(config: PizzaConfig): PizzaPriceBreakdown {
  const pizza = getPizza(config.pizzaId);
  const size = getSize(config.sizeId);
  const crust = getCrust(config.crustId);

  if (!pizza || !size || !crust) {
    return { base: 0, crust: 0, extras: 0, unit: 0 };
  }

  const base = pizza.basePrice + size.priceDelta;
  const crustPrice = crust.price;

  const extras = config.extras.reduce((sum, selection) => {
    const topping = getTopping(selection.toppingId);
    if (!topping) return sum;
    return sum + topping.price * size.toppingMultiplier * halfFactor(selection.half);
  }, 0);

  const unit = round(base + crustPrice + extras);
  return { base, crust: crustPrice, extras: round(extras), unit };
}

/** Precio de una línea del carrito, ya multiplicado por la cantidad. */
export function priceOfLine(line: CartLine): number {
  if (line.kind === 'pizza') {
    return priceOfPizza(line.config).unit * line.quantity;
  }
  const addon = getAddon(line.addonId);
  return (addon?.price ?? 0) * line.quantity;
}

export type OrderTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Cuánto falta para el envío gratis. 0 si ya lo alcanzó o si es retiro. */
  amountToFreeDelivery: number;
  freeDelivery: boolean;
};

/**
 * Totales del pedido.
 *
 * `deliveryMode` importa: en retiro no hay envío, y mostrar "$0" en lugar de esconder
 * la línea deja claro que no se está cobrando nada de más.
 */
export function computeTotals(lines: CartLine[], deliveryMode: 'delivery' | 'retiro'): OrderTotals {
  const subtotal = lines.reduce((sum, line) => sum + priceOfLine(line), 0);

  if (deliveryMode === 'retiro') {
    return { subtotal, deliveryFee: 0, total: subtotal, amountToFreeDelivery: 0, freeDelivery: true };
  }

  const freeDelivery = subtotal >= FREE_DELIVERY_FROM;
  const deliveryFee = subtotal === 0 || freeDelivery ? 0 : DELIVERY_FEE;

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    amountToFreeDelivery: freeDelivery ? 0 : FREE_DELIVERY_FROM - subtotal,
    freeDelivery,
  };
}

/** Precio "desde" del catálogo: la pizza más chica, masa clásica, sin extras. */
export function priceFrom(pizzaId: string): number {
  return priceOfPizza({
    pizzaId,
    sizeId: 'chica',
    crustId: 'clasica',
    extras: [],
  }).unit;
}

/**
 * Descripción legible de una configuración: "Grande · A la piedra · Jamón, Huevo".
 *
 * El carrito muestra esto en lugar de un código interno, para que el usuario pueda
 * verificar lo que pidió de un vistazo antes de pagar.
 */
export function describeConfig(config: PizzaConfig): string {
  const size = getSize(config.sizeId);
  const crust = getCrust(config.crustId);

  const parts: string[] = [];
  if (size) parts.push(size.name);
  if (crust && crust.id !== 'clasica') parts.push(crust.name);

  const extras = config.extras
    .map((selection) => {
      const topping = getTopping(selection.toppingId);
      if (!topping) return null;
      // Cuando se habiliten las mitades, el lado se muestra acá: "Jamón (izq.)".
      if (selection.half === 'whole') return topping.name;
      return `${topping.name} (${selection.half === 'left' ? 'izq.' : 'der.'})`;
    })
    .filter((name): name is string => name !== null);

  if (extras.length > 0) parts.push(extras.join(', '));
  return parts.join(' · ');
}

/** Resumen de una línea en una sola frase, para el seguimiento del pedido. */
export function describeLine(line: CartLine): string {
  if (line.kind === 'addon') {
    const addon = getAddon(line.addonId);
    return addon ? `${addon.name} ${addon.detail}` : '';
  }
  const pizza = getPizza(line.config.pizzaId);
  const size = getSize(line.config.sizeId);
  return `${pizza?.name ?? ''} ${size?.name.toLowerCase() ?? ''}`.trim();
}

export { ADDONS };
