/**
 * Estado del pedido — Forno
 *
 * Carrito, preferencias de entrega e historial, en un solo contexto. Alcanza y sobra para
 * el alcance de la v1; cuando entren perfil, historial avanzado y promociones (etapa 2)
 * conviene partirlo o mover a Zustand/Redux, pero meter esa maquinaria ahora sería
 * complejidad sin beneficio.
 *
 * En producción, `orders` viene de la API y el estado del pedido llega por websocket o
 * push. Acá se simula: ver `SIMULATED_STEP_MS`.
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { DEFAULT_ADDRESS, ETA_MAX, ETA_MIN } from '@/domain/menu';
import { computeTotals } from '@/domain/pricing';
import type {
  CartLine,
  DeliveryMode,
  Order,
  OrderStatusId,
  PaymentMethod,
  PizzaConfig,
} from '@/domain/types';

/**
 * Orden de los estados del pedido. El seguimiento los recorre en secuencia.
 * El texto es el que ve el usuario: lenguaje natural, no jerga de sistema.
 */
export const ORDER_STEPS: { id: OrderStatusId; label: string; hint: string }[] = [
  { id: 'recibido', label: 'Recibido', hint: 'Confirmamos tu pedido' },
  { id: 'preparacion', label: 'En preparación', hint: 'Estamos armando tu pizza' },
  { id: 'horno', label: 'En el horno', hint: 'A 450° por 90 segundos' },
  { id: 'camino', label: 'En camino', hint: 'El pedido salió del local' },
  { id: 'entregado', label: 'Entregado', hint: '¡Buen provecho!' },
];

/**
 * Cada cuánto avanza el estado en el prototipo. En la app real esto lo dicta la cocina.
 * 7 segundos: suficiente para leer el cambio, suficientemente corto para que Carlos vea
 * el flujo completo sin esperar cuarenta minutos.
 */
const SIMULATED_STEP_MS = 7000;

/** IDs de línea. Un contador basta: no hay concurrencia ni persistencia. */
let lineCounter = 0;
const nextLineId = () => `line-${++lineCounter}`;

let orderNumber = 1041;

/**
 * Pedido anterior de muestra.
 *
 * Existe para que "Repetir pedido" tenga algo que repetir la primera vez que se abre la
 * app. Sin esto, la pantalla más importante del flujo de recompra no se puede probar,
 * y es justamente la que Carlos quiere ver funcionando.
 */
function seedPreviousOrder(): Order {
  const placedAt = Date.now() - 12 * 86_400_000;
  const lines: CartLine[] = [
    {
      id: nextLineId(),
      kind: 'pizza',
      quantity: 1,
      config: { pizzaId: 'napolitana', sizeId: 'grande', crustId: 'piedra', extras: [] },
    },
    { id: nextLineId(), kind: 'addon', quantity: 1, addonId: 'coca15' },
  ];
  const totals = computeTotals(lines, 'delivery');

  return {
    id: 'seed-order',
    number: ++orderNumber,
    lines,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    deliveryMode: 'delivery',
    payment: 'efectivo',
    address: DEFAULT_ADDRESS,
    notes: '',
    placedAt,
    status: 'entregado',
  };
}

type OrderContextValue = {
  lines: CartLine[];
  /** Suma de cantidades, para el badge de la pestaña Carrito. */
  itemCount: number;
  deliveryMode: DeliveryMode;
  payment: PaymentMethod;
  address: string;
  notes: string;
  orders: Order[];
  /** El pedido más reciente ya entregado. Alimenta el bloque de recompra. */
  lastOrder: Order | undefined;

  addPizza: (config: PizzaConfig, quantity: number) => void;
  addAddon: (addonId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  replacePizza: (lineId: string, config: PizzaConfig, quantity: number) => void;
  clearCart: () => void;
  /** Carga el último pedido en el carrito. Devuelve `false` si no había ninguno. */
  repeatLastOrder: () => boolean;

  setDeliveryMode: (mode: DeliveryMode) => void;
  setPayment: (method: PaymentMethod) => void;
  setAddress: (address: string) => void;
  setNotes: (notes: string) => void;

  /** Confirma el pedido, vacía el carrito y devuelve el id para navegar al seguimiento. */
  placeOrder: () => string;
  getOrder: (id: string) => Order | undefined;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery');
  const [payment, setPayment] = useState<PaymentMethod>('efectivo');
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [notes, setNotes] = useState('');
  const [orders, setOrders] = useState<Order[]>(() => [seedPreviousOrder()]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Los timers de la simulación no deben sobrevivir al desmontaje del provider.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const addPizza: OrderContextValue['addPizza'] = (config, quantity) => {
    setLines((current) => [...current, { id: nextLineId(), kind: 'pizza', quantity, config }]);
  };

  const addAddon: OrderContextValue['addAddon'] = (addonId) => {
    setLines((current) => {
      // Los acompañamientos no se personalizan, así que se agrupan en una sola línea:
      // dos líneas idénticas de "Coca-Cola 1.5L" en el carrito se leen como un error.
      const existing = current.find((line) => line.kind === 'addon' && line.addonId === addonId);
      if (existing) {
        return current.map((line) =>
          line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...current, { id: nextLineId(), kind: 'addon', quantity: 1, addonId }];
    });
  };

  const setQuantity: OrderContextValue['setQuantity'] = (lineId, quantity) => {
    // Bajar de 1 elimina la línea: es lo que el usuario espera del botón "–" en 1.
    if (quantity <= 0) {
      setLines((current) => current.filter((line) => line.id !== lineId));
      return;
    }
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, quantity } : line)));
  };

  const removeLine: OrderContextValue['removeLine'] = (lineId) => {
    setLines((current) => current.filter((line) => line.id !== lineId));
  };

  const replacePizza: OrderContextValue['replacePizza'] = (lineId, config, quantity) => {
    setLines((current) =>
      current.map((line) =>
        line.id === lineId && line.kind === 'pizza' ? { ...line, config, quantity } : line
      )
    );
  };

  const clearCart = () => setLines([]);

  const lastOrder = orders.length > 0 ? orders[orders.length - 1] : undefined;

  const repeatLastOrder: OrderContextValue['repeatLastOrder'] = () => {
    if (!lastOrder) return false;
    // Se clonan las líneas con ids nuevos: editar el carrito no debe mutar el historial.
    setLines(lastOrder.lines.map((line) => ({ ...line, id: nextLineId() })));
    setDeliveryMode(lastOrder.deliveryMode);
    setPayment(lastOrder.payment);
    setAddress(lastOrder.address);
    return true;
  };

  const placeOrder: OrderContextValue['placeOrder'] = () => {
    const totals = computeTotals(lines, deliveryMode);
    const id = `order-${Date.now()}`;
    const order: Order = {
      id,
      number: ++orderNumber,
      lines,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      deliveryMode,
      payment,
      address,
      notes,
      placedAt: Date.now(),
      status: 'recibido',
    };

    setOrders((current) => [...current, order]);
    setLines([]);
    setNotes('');

    // Simulación del avance en cocina. Ver SIMULATED_STEP_MS.
    ORDER_STEPS.slice(1).forEach((step, index) => {
      const timer = setTimeout(
        () =>
          setOrders((current) =>
            current.map((item) => (item.id === id ? { ...item, status: step.id } : item))
          ),
        SIMULATED_STEP_MS * (index + 1)
      );
      timers.current.push(timer);
    });

    return id;
  };

  const getOrder: OrderContextValue['getOrder'] = (id) => orders.find((order) => order.id === id);

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const value: OrderContextValue = {
    lines,
    itemCount,
    deliveryMode,
    payment,
    address,
    notes,
    orders,
    lastOrder,
    addPizza,
    addAddon,
    setQuantity,
    removeLine,
    replacePizza,
    clearCart,
    repeatLastOrder,
    setDeliveryMode,
    setPayment,
    setAddress,
    setNotes,
    placeOrder,
    getOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder debe usarse dentro de <OrderProvider>');
  return context;
}

export { ETA_MAX, ETA_MIN };
