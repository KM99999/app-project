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
 * ── El problema del amarillo, y cómo se resuelve ──
 *
 * El amarillo es el color más traicionero de todos para una interfaz: `#FBD433` da **1.4:1
 * sobre blanco**. No es "un poco flojo", es invisible. En la referencia, el título "Menu"
 * está en amarillo sobre blanco y prácticamente no se lee.
 *
 * La regla que sale de ahí, y que este sistema aplica sin excepciones:
 *
 * 1. **El amarillo es fondo, nunca texto.** Barra lateral, botones, subrayado de pestaña
 *    activa, chips.
 * 2. **Sobre amarillo se escribe con tinta oscura**, no con blanco. Da 12.3:1. El blanco
 *    daría 1.4:1. Por eso `onBrand` es `#161312` y no `#FFFFFF`.
 * 3. **Para texto dorado sobre blanco existe `brandText`** (#A16207, 4.92:1). Es lo que se
 *    usa donde la referencia pone amarillo sobre blanco: se conserva la intención cromática
 *    y el texto se lee.
 *
 * Amarillo sobre foto oscura —el titular del panel derecho— sí funciona, y es el único
 * lugar donde el amarillo hace de color de texto.
 */
export const color = {
  /**
   * Amarillo de la referencia. **Es un color de fondo, nunca de texto.**
   * 1.4:1 sobre blanco: como texto sería literalmente invisible.
   */
  brand: '#FBD433',
  brandPressed: '#EFC41F',
  /** Amarillo oscurecido, para texto dorado sobre blanco. 4.92:1 ✅ AA */
  brandText: '#A16207',
  /** Fondo teñido para chips y estados suaves. */
  brandSoft: '#FEF7DC',
  brandBorder: '#F7DE7A',

  /** Barra lateral y superficies de marca a plena saturación. */
  rail: '#FBD433',

  /** Segundo tono cálido, para bloques de apoyo. */
  accentSoft: '#FEF9E7',
  accentBorder: '#F5E6A8',

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
  /** Fondo del panel: gris claro, como el de la referencia. */
  surfaceSunken: '#EDEDEE',
  /** Relleno de buscador, pistas de control y cuadros de imagen. */
  surfaceMuted: '#F3F3F4',
  border: '#E4E4E7',
  borderStrong: '#D4D4D8',
  overlay: 'rgba(22, 19, 18, 0.45)',
  /** Velo sobre fotografía, para que el texto encima se lea. */
  photoScrim: 'rgba(22, 19, 18, 0.55)',

  /**
   * Texto **sobre el amarillo**, y es tinta oscura, no blanco.
   *
   * Es la diferencia estructural con una paleta de naranja o índigo: sobre esos, el texto
   * legible es blanco; sobre amarillo, el blanco da 1.4:1 y desaparece. La tinta sobre
   * amarillo da **12.3:1**. Por eso `onBrand` existe como token y ningún componente
   * escribe el color a mano: cambiar la marca no puede dejar botones ilegibles.
   */
  onBrand: '#161312',
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
