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

/** Ancho de la barra lateral. El original usa `max-w-[290px]`. */
export const SIDEBAR_WIDTH = 280;

/** Ancho máximo del contenido en grilla (Inicio). Más allá, la fila deja de leerse de un vistazo. */
export const CONTENT_MAX_WIDTH = 1120;

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && width >= BREAKPOINT_WIDE;
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
