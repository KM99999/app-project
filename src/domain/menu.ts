/**
 * Catálogo — Forno
 *
 * Datos de muestra en el rol de backend. En producción esto llega de una API; la forma
 * de los objetos es la misma, así que reemplazar la fuente no obliga a tocar pantallas.
 *
 * Precios en pesos argentinos. El precio de cada pizza está expresado **en mediana**:
 * los otros tamaños se calculan con `Size.priceDelta`. Un solo número por pizza en lugar
 * de tres evita que el menú se desincronice cuando cambian los precios.
 */

import type { Addon, Crust, MenuCategory, Pizza, Size, Topping } from './types';

export const SIZES: Size[] = [
  { id: 'chica', name: 'Chica', detail: '6 porciones', priceDelta: -2500, toppingMultiplier: 0.75, scale: 0.82 },
  { id: 'mediana', name: 'Mediana', detail: '8 porciones', priceDelta: 0, toppingMultiplier: 1, scale: 0.92 },
  { id: 'grande', name: 'Grande', detail: '12 porciones', priceDelta: 2800, toppingMultiplier: 1.35, scale: 1 },
];

export const CRUSTS: Crust[] = [
  { id: 'clasica', name: 'Clásica', description: 'Media masa, la de siempre', price: 0 },
  { id: 'piedra', name: 'A la piedra', description: 'Fina y crocante', price: 800 },
  { id: 'rellena', name: 'Rellena de queso', description: 'Borde relleno de muzzarella', price: 2200 },
];

export const TOPPINGS: Topping[] = [
  { id: 'jamon', name: 'Jamón', price: 1200, color: '#E79A94', shape: 'strip' },
  { id: 'huevo', name: 'Huevo', price: 700, color: '#FAF3D8', shape: 'ring' },
  { id: 'aceitunas', name: 'Aceitunas', price: 500, color: '#3D3A44', shape: 'dot' },
  { id: 'morron', name: 'Morrón', price: 600, color: '#D95F2B', shape: 'strip' },
  { id: 'cebolla', name: 'Cebolla', price: 500, color: '#E9DDE8', shape: 'ring' },
  { id: 'albahaca', name: 'Albahaca', price: 400, color: '#3E8E4F', shape: 'leaf' },
  { id: 'pepperoni', name: 'Pepperoni', price: 1400, color: '#B03A2E', shape: 'dot' },
  { id: 'tomate', name: 'Tomate en rodajas', price: 600, color: '#D64541', shape: 'ring' },
  { id: 'roquefort', name: 'Roquefort', price: 1600, color: '#EDE7CF', shape: 'dot' },
  { id: 'rucula', name: 'Rúcula', price: 800, color: '#4F9E52', shape: 'leaf' },
];

/**
 * Bebidas, acompañamientos y postres.
 *
 * Las fotos vienen de Wikimedia Commons, recortadas al aspecto de la tarjeta. Son de
 * licencia libre pero **cuatro de las cinco piden atribución** (CC BY-SA): la lista
 * completa está en `assets/images/addons/CREDITOS.md`. Antes de salir a producción
 * conviene reemplazarlas por fotografía propia del local, que además va a mostrar el
 * producto real y no una botella genérica.
 */
export const ADDONS: Addon[] = [
  {
    id: 'coca15',
    name: 'Coca-Cola',
    detail: '1.5 L',
    price: 2500,
    color: '#B03A2E',
    category: 'bebidas',
    image: require('@/assets/images/addons/coca15.jpg'),
  },
  {
    id: 'agua',
    name: 'Agua mineral',
    detail: '500 ml',
    price: 1800,
    color: '#7FB2D9',
    category: 'bebidas',
    image: require('@/assets/images/addons/agua.jpg'),
  },
  {
    id: 'cerveza',
    name: 'Cerveza artesanal',
    detail: '473 ml',
    price: 2800,
    color: '#C68A3E',
    category: 'bebidas',
    image: require('@/assets/images/addons/cerveza.jpg'),
  },
  {
    id: 'faina',
    name: 'Fainá',
    detail: 'Porción',
    price: 1900,
    color: '#E8B06A',
    category: 'acompanamientos',
    image: require('@/assets/images/addons/faina.jpg'),
  },
  {
    id: 'postre',
    name: 'Flan casero',
    detail: 'Con dulce de leche',
    price: 2200,
    color: '#C9884A',
    category: 'postres',
    image: require('@/assets/images/addons/postre.jpg'),
  },
];

/**
 * Categorías del menú, en el orden en que se muestran los chips.
 *
 * "Todas" no es una categoría del modelo: es el estado sin filtro, y por eso vive acá y
 * no en `MenuCategory`.
 */
export const CATEGORIES: { id: MenuCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pizzas', label: 'Pizzas' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'acompanamientos', label: 'Para compartir' },
  { id: 'postres', label: 'Postres' },
];

export const PIZZAS: Pizza[] = [
  {
    id: 'muzzarella',
    name: 'Muzzarella',
    description: 'Salsa de tomate, muzzarella y aceitunas',
    basePrice: 10400,
    baseToppingIds: ['aceitunas'],
    popular: true,
    vegetarian: true,
    image: require('@/assets/images/pizzas/muzzarella.jpg'),
  },
  {
    id: 'napolitana',
    name: 'Napolitana',
    description: 'Salsa, muzzarella, rodajas de tomate y albahaca',
    basePrice: 11400,
    baseToppingIds: ['tomate', 'albahaca'],
    popular: true,
    vegetarian: true,
    image: require('@/assets/images/pizzas/napolitana.jpg'),
  },
  {
    id: 'fugazzeta',
    name: 'Fugazzeta',
    description: 'Cebolla, muzzarella y orégano, sin salsa',
    basePrice: 11900,
    baseToppingIds: ['cebolla'],
    popular: true,
    vegetarian: true,
    image: require('@/assets/images/pizzas/fugazzeta.jpg'),
  },
  {
    id: 'calabresa',
    name: 'Calabresa',
    description: 'Salsa, muzzarella, pepperoni y morrón',
    basePrice: 12400,
    baseToppingIds: ['pepperoni', 'morron'],
    popular: false,
    vegetarian: false,
    image: require('@/assets/images/pizzas/calabresa.jpg'),
  },
  {
    id: 'cuatro-quesos',
    name: 'Cuatro quesos',
    description: 'Muzzarella, roquefort, parmesano y provolone',
    basePrice: 13200,
    baseToppingIds: ['roquefort'],
    popular: false,
    vegetarian: true,
    image: require('@/assets/images/pizzas/cuatro-quesos.jpg'),
  },
  {
    id: 'especial',
    name: 'Especial de la casa',
    description: 'Jamón, morrón, huevo y aceitunas',
    basePrice: 12900,
    baseToppingIds: ['jamon', 'morron', 'huevo', 'aceitunas'],
    popular: false,
    vegetarian: false,
    image: require('@/assets/images/pizzas/especial.jpg'),
  },
];

/** Costo de envío y el umbral para bonificarlo. El umbral empuja el ticket promedio. */
export const DELIVERY_FEE = 1500;
export const FREE_DELIVERY_FROM = 25000;

/** Rango de entrega estimado, en minutos. Rango y no número exacto — ver docs/03. */
export const ETA_MIN = 35;
export const ETA_MAX = 45;

/** Dirección de muestra. En producción viene del perfil del usuario. */
export const DEFAULT_ADDRESS = 'Av. Corrientes 1234, Piso 3';

// Claves de tipo `string` a propósito: los ids llegan desde parámetros de ruta, que
// siempre son strings. Estrechar acá evita un cast en cada pantalla.
const pizzaById = new Map<string, Pizza>(PIZZAS.map((p) => [p.id, p]));
const sizeById = new Map<string, Size>(SIZES.map((s) => [s.id, s]));
const crustById = new Map<string, Crust>(CRUSTS.map((c) => [c.id, c]));
const toppingById = new Map<string, Topping>(TOPPINGS.map((t) => [t.id, t]));
const addonById = new Map<string, Addon>(ADDONS.map((a) => [a.id, a]));

export const getPizza = (id: string): Pizza | undefined => pizzaById.get(id);
export const getSize = (id: string): Size | undefined => sizeById.get(id);
export const getCrust = (id: string): Crust | undefined => crustById.get(id);
export const getTopping = (id: string): Topping | undefined => toppingById.get(id);
export const getAddon = (id: string): Addon | undefined => addonById.get(id);

/**
 * Los valores por defecto del Constructor: los más pedidos.
 *
 * No es un detalle menor. Son lo que permite llegar a "Agregar al carrito" sin tocar
 * nada, que es el camino que recorre la mayor parte de los usuarios.
 */
export const DEFAULT_SIZE_ID = 'mediana' as const;
export const DEFAULT_CRUST_ID = 'clasica' as const;
