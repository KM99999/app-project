/**
 * Estructura de pantalla — Forno
 *
 * Encabezado, cuerpo y barra fija inferior. Centralizado para que el área segura, los
 * márgenes y el espacio reservado bajo la barra sean idénticos en las cinco pantallas;
 * resolverlo pantalla por pantalla es la vía rápida a que una tenga el botón tapado por
 * el gesto de inicio de iOS.
 */

import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './text';
import { color, elevation, space, touchTarget } from './tokens';

export function Screen({ style, ...rest }: ViewProps) {
  return <View style={[styles.screen, style]} {...rest} />;
}

/** Encabezado con retroceso opcional. `onBack` ausente = pantalla raíz de la pestaña. */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <View style={styles.chevron} />
        </Pressable>
      ) : null}

      <View style={styles.headerText}>
        <Text variant="h2" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
    </View>
  );
}

/**
 * Barra fija inferior.
 *
 * Vive en la zona del pulgar y sostiene la acción principal junto al total en vivo.
 * Es el componente que materializa "el monto no sorprende al final": el número está a la
 * vista durante toda la personalización, no aparece recién en el resumen.
 */
export function StickyBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
      {children}
    </View>
  );
}

/**
 * Altura a reservar al final de un ScrollView que convive con una StickyBar.
 * Sin esto, el último elemento de la lista queda debajo de la barra y no se puede leer.
 */
export const STICKY_BAR_CLEARANCE = 132;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.surfaceSunken },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  headerText: { flex: 1, gap: 2 },
  backButton: {
    width: touchTarget,
    height: touchTarget,
    marginLeft: -space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Chevron con dos bordes rotados: sin fuente de iconos, nítido en cualquier densidad.
  chevron: {
    width: 11,
    height: 11,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: color.ink,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  pressed: { opacity: 0.6 },
  stickyBar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.border,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
    ...elevation.bar,
  },
});
