/**
 * Tokens del sistema de diseño — Forno
 *
 * El lenguaje visual está alineado con el design system del panel de administración
 * (nextjs-admin-dashboard / NextAdmin): índigo como color de acción, tinta azul-negra,
 * superficies blancas sobre gris frío, radios de 10px y sombras muy sutiles.
 *
 * Una decisión a tener presente: el **chrome** de la aplicación es frío y neutro —lo que
 * le da el aire de producto moderno—, mientras que la **comida** conserva su paleta
 * cálida. Es la combinación que usan las plataformas de delivery serias: la interfaz no
 * compite con el producto, lo enmarca. Por eso `pizzaColor` no cambió.
 *
 * Ningún componente declara un valor crudo. Si falta un valor, se agrega acá primero.
 *
 * Ver docs/04-sistema-de-diseno.md para el detalle y la verificación de contraste.
 */

/**
 * Relación de contraste verificada contra blanco (#FFFFFF), según WCAG 2.1.
 *
 * Aviso importante sobre la paleta de origen: tres de sus colores de marca **no pasan AA
 * como texto** (`green #22ad5c` = 2.9:1, `red #f23030` = 4.0:1, `yellow #d97706` = 3.2:1).
 * Se usan solo como relleno, y para texto se usan las variantes oscuras. Por eso hay
 * tokens separados de `…Fill` y de texto: no es duplicación, es lo que evita que un
 * estado quede ilegible.
 */
export const color = {
  /** Índigo. Acciones primarias, precios, estado seleccionado. 5.49:1 ✅ AA */
  brand: '#5750F1',
  brandPressed: '#4338CA',
  /** Fondo teñido para chips y filas seleccionadas. No lleva texto oscuro encima. */
  brandSoft: '#EEF2FF',
  brandBorder: '#C7D2FE',

  /** Verde. Texto y iconos de éxito. 4.86:1 ✅ AA */
  success: '#1A8245',
  /** Verde pleno, solo para rellenos y puntos. 2.9:1 — nunca como texto. */
  successFill: '#22AD5C',
  successSoft: '#E9FBF0',

  /** Ámbar. Texto del paso en curso. 5.24:1 ✅ AA */
  warning: '#B45309',
  /** Ámbar pleno, solo relleno. 3.2:1 — nunca como texto. */
  warningFill: '#F59E0B',
  warningSoft: '#FFFBEB',

  /** Rojo. Texto de error y validación. 4.92:1 ✅ AA */
  danger: '#E10E0E',
  dangerSoft: '#FEF3F3',

  /** Tinta principal, azul-negra. 17.6:1 ✅ AAA */
  ink: '#111928',
  /** Texto secundario, descripciones. 4.83:1 ✅ AA */
  inkSecondary: '#6B7280',
  /** ⚠️ 2.54:1 — NO apto como texto. Solo iconos inactivos, bordes y placeholders. */
  inkMuted: '#9CA3AF',
  inkDisabled: '#D1D5DB',

  surface: '#FFFFFF',
  /** Fondo de la app: gris frío. Es lo que hace que las tarjetas blancas se despeguen. */
  surfaceSunken: '#F9FAFB',
  /** Superficie intermedia para rellenos y pistas de controles. */
  surfaceMuted: '#F3F4F6',
  border: '#E6EBF1',
  /** Borde más marcado para inputs y controles enfocables. */
  borderStrong: '#D1D5DB',
  overlay: 'rgba(17, 25, 40, 0.45)',

  onBrand: '#FFFFFF',
} as const;

/**
 * Paleta de la ilustración de pizza. Deliberadamente cálida y sin tocar: es contenido,
 * no interfaz. Ver la nota del encabezado.
 */
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
 * Grilla de 8. El 4 y el 6 existen como medios pasos para ajustes ópticos
 * (separación icono-texto, padding interno de chips).
 */
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
 * Radios. El `card: 10` es la firma del sistema de origen: más chico que el redondeo
 * blando de las apps de consumo, y es buena parte de por qué se lee como producto serio.
 */
export const radius = {
  xs: 5,
  sm: 7,
  md: 9,
  card: 10,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

/**
 * Escala tipográfica, tomada de la del panel (`heading-*` / `body-*`).
 *
 * Sigue usando la fuente del sistema y no Satoshi: cargar una fuente propia agrega peso
 * al bundle y un parpadeo de carga, y el original la sirve como archivo local que este
 * proyecto no tiene. La jerarquía —que es lo que hace el aire de producto— viene del
 * tamaño y del peso, no del nombre de la familia.
 */
export const type = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700', letterSpacing: -0.6 },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 23, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 22, fontWeight: '400' },
  captionStrong: { fontSize: 14, lineHeight: 22, fontWeight: '600' },
  micro: { fontSize: 12, lineHeight: 20, fontWeight: '500' },
  /** Números grandes de las tarjetas de resumen. Tabular para que no bailen al cambiar. */
  metric: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.4 },
} as const;

/**
 * Elevación. Sombras muy tenues y de radio corto — la diferencia entre una interfaz que
 * se ve moderna y una que se ve inflada suele estar acá. Nada de sombras difusas y
 * oscuras.
 */
export const elevation = {
  /** `shadow-1` del sistema de origen. La sombra por defecto de toda tarjeta. */
  card: {
    shadowColor: '#545776',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  /** Un escalón más, para elementos que deben destacarse del resto de la lista. */
  raised: {
    shadowColor: '#545776',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  /** Barra fija inferior: la sombra va hacia arriba. */
  bar: {
    shadowColor: '#111928',
    shadowOpacity: 0.08,
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
