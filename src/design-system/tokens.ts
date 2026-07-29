/**
 * Tokens del sistema de diseño — Forno
 *
 * Lenguaje visual tomado de la referencia de diseño de app de delivery: naranja vivo,
 * superficies blancas sobre gris muy claro, radios grandes y generosos, fotografía como
 * protagonista y navegación flotante en píldora.
 *
 * Es un lenguaje cálido y de consumo, a diferencia del anterior (frío, de panel de
 * administración). Acá la interfaz **acompaña a la comida en temperatura** en lugar de
 * contrastar con ella.
 *
 * Ningún componente declara un valor crudo. Si falta un valor, se agrega acá primero.
 *
 * Ver docs/04-sistema-de-diseno.md para el detalle y la verificación de contraste.
 */

/**
 * Relación de contraste verificada contra blanco (#FFFFFF), según WCAG 2.1.
 *
 * ── El problema del naranja, y cómo se resuelve ──
 *
 * El naranja vivo de la referencia (#F26522) da **3.15:1 sobre blanco**. Eso alcanza para
 * texto grande (≥18.66px en negrita) y para elementos no textuales, pero **no para texto
 * normal**, que necesita 4.5:1. Es la trampa clásica de este tipo de paletas: se ven
 * espectaculares en una maqueta y dejan ilegible la mitad de la app real.
 *
 * La solución tiene dos partes y ninguna sacrifica el aspecto:
 *
 * 1. `brand` se usa como **relleno** —botones, chips activos, acentos—. Sobre él, el texto
 *    blanco va en 19px negrita, que sí califica como texto grande. La referencia ya usa
 *    etiquetas grandes y gruesas en sus botones, así que no hay que deformar el diseño.
 * 2. `brandText` es un naranja más profundo (5.18:1) para **texto naranja sobre blanco**:
 *    precios, enlaces, la palabra de acento del título.
 *
 * No es duplicación: es lo que evita que un precio quede ilegible.
 */
export const color = {
  /** Naranja vivo de la referencia. Relleno, nunca texto chico. 3.15:1 — AA large */
  brand: '#F26522',
  brandPressed: '#D9541A',
  /** Naranja profundo, para texto sobre blanco. 5.18:1 ✅ AA */
  brandText: '#C2410C',
  /** Fondo teñido para chips y estados suaves. */
  brandSoft: '#FFF1EA',
  brandBorder: '#FBD5C2',

  /** Amarillo cálido del banner promocional de la referencia. Solo fondo. */
  accentSoft: '#FDF3D7',
  accentBorder: '#F6E4B0',

  /** Verde. Texto e iconos de éxito. 4.86:1 ✅ AA */
  success: '#1A8245',
  /** Verde pleno, solo relleno. 2.9:1 — nunca texto. */
  successFill: '#22AD5C',
  successSoft: '#E9FBF0',

  /** Ámbar. Texto del paso en curso del seguimiento. 5.24:1 ✅ AA */
  warning: '#B45309',
  warningFill: '#F59E0B',
  warningSoft: '#FFFBEB',

  /** Rojo. Texto de error. 4.92:1 ✅ AA */
  danger: '#E10E0E',
  dangerSoft: '#FEF3F3',

  /** Tinta principal, casi negra y ligeramente cálida. 17.4:1 ✅ AAA */
  ink: '#161312',
  /** Texto secundario. 4.83:1 ✅ AA */
  inkSecondary: '#6B7280',
  /** ⚠️ 2.54:1 — NO apto como texto. Solo iconos inactivos, bordes y placeholders. */
  inkMuted: '#9CA3AF',
  inkDisabled: '#D1D5DB',

  surface: '#FFFFFF',
  /** Fondo de la app: gris muy claro y neutro, como el de la referencia. */
  surfaceSunken: '#F4F4F5',
  /** Relleno de buscador, pistas de control y cuadros de imagen. */
  surfaceMuted: '#F1F1F2',
  border: '#E9E9EC',
  borderStrong: '#D4D4D8',
  overlay: 'rgba(22, 19, 18, 0.45)',

  onBrand: '#FFFFFF',
} as const;

/** Grilla de 8, con 4 y 6 como medios pasos para ajustes ópticos. */
export const space = {
  xs: 4,
  xs2: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

/**
 * Radios **grandes**. Es la mitad del carácter de este lenguaje: donde el panel de
 * administración usaba 10, acá las tarjetas van en 24 y todo lo accionable es píldora
 * completa. Redondear poco haría que la misma paleta se viera severa.
 */
export const radius = {
  /** Marcas pequeñas: indicadores, casillas, etiquetas. */
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  card: 24,
  xl: 28,
  /** Hojas y contenedores que suben desde abajo. */
  sheet: 32,
  full: 999,
} as const;

/**
 * Escala tipográfica. Títulos grandes y gruesos con interletrado negativo, que es lo que
 * da el aire de la referencia.
 *
 * `button` existe como variante propia —19px/700— y no es un capricho: es el tamaño que
 * hace que el texto blanco sobre naranja califique como texto grande y cumpla AA. Ver la
 * nota del bloque `color`.
 */
export const type = {
  display: { fontSize: 30, lineHeight: 38, fontWeight: '800', letterSpacing: -0.7 },
  h1: { fontSize: 26, lineHeight: 33, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 21, lineHeight: 27, fontWeight: '700', letterSpacing: -0.4 },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '700', letterSpacing: -0.2 },
  button: { fontSize: 19, lineHeight: 25, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 23, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
  captionStrong: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  micro: { fontSize: 12, lineHeight: 20, fontWeight: '500' },
  metric: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.4 },
} as const;

/**
 * Elevación suave y difusa, lo contrario de las sombras cortas del panel. Acá las tarjetas
 * flotan; es parte del carácter cálido del lenguaje.
 */
export const elevation = {
  card: {
    shadowColor: '#161312',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#161312',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  /** Navegación flotante y barra fija: sombra amplia hacia arriba. */
  bar: {
    shadowColor: '#161312',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -2 },
    elevation: 16,
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
