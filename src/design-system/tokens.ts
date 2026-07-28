/**
 * Tokens del sistema de diseño — Forno
 *
 * Fuente única de verdad para color, tipografía, espaciado, radios y elevación.
 * Ningún componente debe declarar un valor crudo (un `#hex`, un `padding: 13`).
 * Si hace falta un valor nuevo, se agrega acá primero.
 *
 * Equivalen a las "variables" de Figma: al portarse a Flutter o a otro proyecto RN,
 * este archivo es lo único que hay que traducir.
 *
 * Ver docs/04-sistema-de-diseno.md para el detalle y la verificación de contraste.
 */

/** Relación de contraste verificada contra blanco (#FFFFFF), según WCAG 2.1. */
export const color = {
  /** Rojo ladrillo de horno. Acciones primarias, precios, estado seleccionado. 5.35:1 AA */
  brand: '#C8321E',
  brandPressed: '#A32717',
  /** Fondo teñido para chips y estados seleccionados. Nunca lleva texto encima directamente. */
  brandSoft: '#FDEDE9',

  /** Verde albahaca. Confirmación y pasos completados. 4.85:1 AA */
  success: '#1F7A4D',
  successSoft: '#E8F5EE',

  /** Ámbar. Paso en curso del seguimiento. 5.24:1 AA */
  warning: '#B45309',
  warningSoft: '#FEF3E2',

  /** Texto principal. 15.8:1 AAA */
  ink: '#1A1614',
  /** Texto secundario, descripciones. 7.9:1 AAA */
  inkSecondary: '#57504C',
  /** Solo texto ≥18.66px bold, iconografía y bordes. 3.81:1 — NO usar en texto de cuerpo. */
  inkMuted: '#8A817C',
  /** Estados deshabilitados. Sin requisito de contraste. */
  inkDisabled: '#C9C2BD',

  surface: '#FFFFFF',
  /** Fondo de la app y de secciones hundidas. */
  surfaceSunken: '#F7F4F1',
  border: '#E7E2DE',
  overlay: 'rgba(26, 22, 20, 0.45)',

  onBrand: '#FFFFFF',
} as const;

/** Paleta de la ilustración procedural de pizza. Separada: no es UI, es contenido. */
export const pizzaColor = {
  crust: '#E8B06A',
  crustEdge: '#D19A50',
  sauce: '#C43C22',
  cheese: '#F2C14E',
  basil: '#3E8E4F',
  pepperoni: '#B03A2E',
  olive: '#3D3A44',
  onion: '#E9DDE8',
  ham: '#E79A94',
  egg: '#FAF3D8',
  pepper: '#D95F2B',
} as const;

/**
 * Grilla de 8. El 4 existe solo como medio paso para ajustes ópticos
 * (separación icono-texto, padding interno de chips).
 */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/**
 * Escala tipográfica. Sin fuentes personalizadas a propósito: se usa la del sistema
 * (SF Pro en iOS, Roboto en Android). Respeta las preferencias de tamaño de texto del
 * usuario, no agrega peso al bundle y es lo que esperan tanto HIG como Material 3.
 */
export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  captionStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  micro: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

/**
 * Elevación discreta. Sombras suaves y cálidas — una sombra gris pura sobre un fondo
 * cálido se ve sucia.
 */
export const elevation = {
  card: {
    shadowColor: '#1A1614',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  /** Barra fija inferior: la sombra va hacia arriba. */
  bar: {
    shadowColor: '#1A1614',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
} as const;

/**
 * Área táctil mínima. Material 3 pide 48dp, iOS HIG pide 44pt: se toma el mayor.
 * Todo lo accionable debe cumplirlo, aunque el pixel visible sea más chico
 * (en ese caso se usa `hitSlop`).
 */
export const touchTarget = 48;

/** Duraciones de animación, en ms. Cortas: la app tiene que sentirse instantánea. */
export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;
