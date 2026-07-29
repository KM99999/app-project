/**
 * Modelo de dominio — Forno
 *
 * ── La decisión de arquitectura más importante del proyecto ──
 *
 * Carlos preguntó si convenía permitir pizzas por mitades o solo combinaciones fijas.
 * La respuesta acordada fue: v1 con combinaciones fijas + personalización básica, pero
 * con la arquitectura lista para mitades, de modo que agregarlas después no obligue a
 * rehacer la app.
 *
 * Así se cumple: cada ingrediente seleccionado carga un campo `half` desde el día uno.
 * En la v1 el único valor que se emite es `'whole'`, porque `FEATURES.halves` está en
 * `false` y la interfaz no ofrece otra cosa. El motor de precios, el carrito, el resumen
 * del pedido y la ilustración de la pizza ya saben interpretar `'left'` y `'right'`.
 *
 * Habilitar mitades en la v2 = poner el flag en `true` y diseñar el selector por lado.
 * Sin migración de datos, sin refactor del carrito, sin tocar el motor de precios.
 */

/** Lado de la pizza al que aplica un ingrediente. Ver el bloque de arriba. */
export type PizzaHalf = 'whole' | 'left' | 'right';

export type SizeId = 'chica' | 'mediana' | 'grande';
export type CrustId = 'clasica' | 'piedra' | 'rellena';

/** Cómo se dibuja un ingrediente en la ilustración procedural de la pizza. */
export type ToppingShape = 'dot' | 'ring' | 'leaf' | 'strip';

export type Topping = {
  id: string;
  name: string;
  /** Recargo para una pizza mediana. Escala con el tamaño y con el lado. */
  price: number;
  color: string;
  shape: ToppingShape;
};

export type Size = {
  id: SizeId;
  name: string;
  /** Texto de apoyo: "8 porciones". Ayuda a decidir sin tener que estimar. */
  detail: string;
  /** Diferencia contra el precio base de la pizza (que está expresado en mediana). */
  priceDelta: number;
  /** Multiplicador del recargo por ingrediente: una grande lleva más ingrediente. */
  toppingMultiplier: number;
  /** Diámetro relativo para la ilustración. */
  scale: number;
};

export type Crust = {
  id: CrustId;
  name: string;
  description: string;
  price: number;
};

export type Pizza = {
  id: string;
  name: string;
  description: string;
  /** Precio de la pizza mediana con masa clásica y sin extras. */
  basePrice: number;
  /** Ingredientes que ya vienen en la pizza. Alimenta la descripción del carrito. */
  baseToppingIds: string[];
  popular: boolean;
  /**
   * Si no lleva carne. Alimenta las pestañas Veg / No veg del menú.
   *
   * Es un dato del producto y no una etiqueta de interfaz: quien cambie la receta de una
   * pizza tiene que poder corregir esto en un solo lugar.
   */
  vegetarian: boolean;
  /**
   * Fotografía del producto, empaquetada con la app (`require`).
   *
   * Es un `require` y no una URL: el prototipo tiene que abrirse sin red y sin estados de
   * carga. `ImageSourcePropType` no se importa acá para no atar el modelo de dominio a
   * React Native — el tipo real lo resuelve el consumidor.
   */
  image: number;
};

/** Categorías del menú. Alimentan la fila de chips de la pantalla de Inicio. */
export type MenuCategory = 'pizzas' | 'bebidas' | 'acompanamientos' | 'postres';

/** Bebidas, acompañamientos y postres. No se personalizan. */
export type Addon = {
  id: string;
  name: string;
  detail: string;
  price: number;
  /** Tinte de respaldo, detrás de la foto mientras carga. */
  color: string;
  category: Exclude<MenuCategory, 'pizzas'>;
  /** Fotografía del producto, empaquetada con la app. Ver la nota en `Pizza.image`. */
  image: number;
};

/** Un ingrediente extra elegido por el usuario, con el lado al que aplica. */
export type ToppingSelection = {
  toppingId: string;
  half: PizzaHalf;
};

/** Una pizza configurada. Es lo que produce el Constructor. */
export type PizzaConfig = {
  pizzaId: string;
  sizeId: SizeId;
  crustId: CrustId;
  extras: ToppingSelection[];
};

export type CartLine =
  | { id: string; kind: 'pizza'; quantity: number; config: PizzaConfig }
  | { id: string; kind: 'addon'; quantity: number; addonId: string };

export type OrderStatusId = 'recibido' | 'preparacion' | 'horno' | 'camino' | 'entregado';

export type DeliveryMode = 'delivery' | 'retiro';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta';

export type Order = {
  id: string;
  /** Número visible para el usuario: "Pedido #1042". */
  number: number;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMode: DeliveryMode;
  payment: PaymentMethod;
  address: string;
  notes: string;
  /** Momento de confirmación, en epoch ms. */
  placedAt: number;
  status: OrderStatusId;
};

/**
 * Interruptores de alcance. Lo que está en `false` es trabajo de la etapa 2:
 * el código de soporte ya existe, falta el diseño de la interacción.
 */
export const FEATURES = {
  /** Pizzas por mitades con ingredientes por lado. Ver el bloque del encabezado. */
  halves: false,
} as const;
