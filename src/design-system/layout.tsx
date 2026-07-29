/**
 * Layout responsivo — Forno
 *
 * La app nació como diseño móvil. En una pantalla ancha, ese layout se estira: las
 * tarjetas de métricas se separan hasta perder relación entre sí y las filas del menú
 * cruzan 1900px de ancho. Acá viven las piezas que resuelven eso.
 *
 * El corte es en 1024px, el mismo `lg` del panel de administración.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';

/** Corte a partir del cual se muestra la barra lateral. `lg` del sistema de origen. */
export const BREAKPOINT_WIDE = 1024;

/**
 * Ancho del riel lateral. Angosto a propósito: en la referencia es una franja de icono más
 * etiqueta, no un panel de navegación con texto corrido.
 */
export const SIDEBAR_WIDTH = 108;

/**
 * Corte para pantallas muy anchas. A partir de acá el menú pasa a dos columnas de filas:
 * apiladas en una sola, el contenido queda angosto y larguísimo y deja media pantalla
 * vacía a los costados.
 */
export const BREAKPOINT_XWIDE = 1400;

/**
 * Ancho máximo del contenido en grilla (Inicio).
 *
 * Generoso a propósito: con el menú en dos columnas, el contenido tiene que poder ocupar
 * el ancho real de un monitor. El techo sigue existiendo porque más allá de esto una fila
 * se vuelve tan larga que deja de leerse de un vistazo.
 *
 * El valor está elegido para que en un monitor de ~1790px —el caso que reportó el
 * cliente— no sobre espacio: sin holgura, el bloque llena el ancho junto al riel y no hay
 * nada que se vea corrido a un lado. Es la forma más simple de resolver el centrado: que
 * no quede hueco que centrar.
 */
export const CONTENT_MAX_WIDTH = 1680;

/**
 * Ancho máximo del contenido de una sola columna: carrito, checkout, constructor,
 * seguimiento. Más angosto que la grilla a propósito — un formulario de 1100px de ancho
 * obliga a barrer la pantalla con la vista entre la etiqueta y el campo.
 */
export const CONTENT_MAX_WIDTH_NARROW = 760;

/**
 * Estilo para el `contentContainerStyle` de un ScrollView de una sola columna. Centra y
 * limita el ancho sin necesidad de envolver el contenido en otra View.
 */
export const narrowContent = {
  width: '100%',
  maxWidth: CONTENT_MAX_WIDTH_NARROW,
  alignSelf: 'center',
} as const;

/**
 * `true` cuando la ventana es de escritorio.
 *
 * Devuelve `false` en el primer render **a propósito**, aunque la ventana ya sea ancha.
 * El export es estático: el HTML se genera en el build, donde no hay ventana. Si esto
 * devolviera el valor real de entrada, el servidor pintaría el árbol móvil y el cliente
 * el de escritorio, y React abortaría la hidratación por diferencia de estructura — el
 * mismo error #418 que ya nos mordió con el saludo, pero peor, porque acá cambia el árbol
 * entero y no un texto.
 *
 * Al montarse pasa a su valor real. El salto es de un frame y no se percibe.
 */
export function useIsWide(): boolean {
  const { width } = useWindowDimensions();
  const mounted = useMounted();
  return mounted && width >= BREAKPOINT_WIDE;
}

/**
 * Relleno extra a la derecha para que el contenido quede centrado **respecto de la
 * ventana**, y no de la franja que sobra a la derecha del riel.
 *
 * El problema: el riel ocupa `SIDEBAR_WIDTH` a la izquierda, así que `Bounded` centra
 * dentro de lo que queda. Eso deja el bloque medio riel más a la derecha del centro real
 * de la pantalla —58px medidos— y se nota.
 *
 * La corrección es un margen espejo del riel sobre la derecha, pero **solo cuando hay
 * holgura**: si el contenido ya llena el ancho disponible, agregar el espejo abriría una
 * franja vacía a la derecha, que se ve peor que el desvío que corrige. De ahí el
 * `Math.min`: nunca se toma más espacio del que realmente sobra.
 */
export function useWindowCenteringPad(): number {
  const { width } = useWindowDimensions();
  const mounted = useMounted();
  if (!mounted || width < BREAKPOINT_WIDE) return 0;
  const slack = width - SIDEBAR_WIDTH - CONTENT_MAX_WIDTH;
  return slack > 0 ? Math.min(SIDEBAR_WIDTH, slack) : 0;
}

/** `true` en monitores anchos, donde el menú entra en dos columnas. Ver `useIsWide`. */
export function useIsExtraWide(): boolean {
  const { width } = useWindowDimensions();
  const mounted = useMounted();
  return mounted && width >= BREAKPOINT_XWIDE;
}

/**
 * `false` durante el render inicial, `true` una vez montado en el navegador.
 *
 * Es la herramienta para todo lo que **no existe en el build**: la hora, el ancho de la
 * ventana, las fuentes de iconos. Ese contenido no puede decidirse durante el primer
 * render sin romper la hidratación.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Centra el contenido y le pone un techo de ancho. En móvil no hace nada: el ancho
 * disponible ya es menor que el techo.
 */
export function Bounded({
  children,
  style,
  maxWidth = CONTENT_MAX_WIDTH,
}: {
  children: ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
}) {
  return <View style={[styles.bounded, { maxWidth }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  bounded: { width: '100%', alignSelf: 'center' },
});
