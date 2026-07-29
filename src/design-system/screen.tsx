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

import { Bounded, CONTENT_MAX_WIDTH_NARROW } from './layout';
import { Text } from './text';
import { color, elevation, radius, space } from './tokens';

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
      <Bounded maxWidth={CONTENT_MAX_WIDTH_NARROW} style={styles.headerInner}>
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
          <Text variant="h3" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="micro" tone="secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right}
      </Bounded>
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
/**
 * `underFloatingNav` reserva abajo el alto de la píldora de navegación flotante.
 *
 * Hace falta en las pantallas que son pestaña y además tienen su propia acción fija
 * (el carrito): la píldora está posicionada en absoluto sobre el contenido y, sin este
 * espacio, se apoyaría justo encima del botón principal.
 */
export function StickyBar({
  children,
  underFloatingNav = false,
}: {
  children: React.ReactNode;
  underFloatingNav?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, space.lg) + (underFloatingNav ? 84 : 0);
  return (
    <View style={[styles.stickyBar, { paddingBottom: bottom }]}>
      {/* El contenido se limita igual que el de la pantalla: sin esto, en escritorio el
          botón de confirmar cruzaría 1600px y el total quedaría a un extremo. */}
      <Bounded maxWidth={CONTENT_MAX_WIDTH_NARROW} style={styles.stickyInner}>
        {children}
      </Bounded>
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
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  headerText: { flex: 1, gap: 2 },
  // Botón de volver como cuadrado con borde: en el lenguaje del panel los controles de
  // navegación son objetos con superficie propia, no glifos sueltos flotando.
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Chevron con dos bordes rotados: sin fuente de iconos, nítido en cualquier densidad.
  chevron: {
    width: 9,
    height: 9,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: color.ink,
    transform: [{ rotate: '45deg' }],
    marginLeft: 3,
  },
  pressed: { opacity: 0.6 },
  stickyBar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.border,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    ...elevation.bar,
  },
  stickyInner: { gap: space.md },
});
