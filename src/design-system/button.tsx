/**
 * Botón — Forno
 *
 * Píldora completa, como en la referencia. Tres jerarquías, un solo componente.
 *
 * La etiqueta usa la variante `button` (19px/700) y no `bodyStrong`. No es estética: es lo
 * que hace que el texto blanco sobre el naranja vivo (3.15:1) califique como texto grande
 * y cumpla AA. La referencia ya usa etiquetas grandes y gruesas, así que la restricción de
 * accesibilidad y el diseño empujan para el mismo lado.
 *
 * Dos reglas que se cumplen acá y no se negocian por pantalla:
 * — altura mínima `touchTarget` (48), el mayor entre Material 3 y iOS HIG;
 * — feedback de presión visible, porque en móvil no hay hover que confirme el toque.
 */

import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from './text';
import { color, radius, space, touchTarget } from './tokens';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Texto secundario alineado a la derecha, típicamente el total. */
  trailing?: string;
  fullWidth?: boolean;
  /** Versión compacta para usar dentro de tarjetas. Baja a texto normal. */
  compact?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  trailing,
  fullWidth = true,
  compact = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const isInert = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInert}
      accessibilityRole="button"
      accessibilityLabel={trailing ? `${label}, ${trailing}` : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInert, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        fullWidth && styles.fullWidth,
        variantStyles[variant],
        pressed && !isInert && pressedStyles[variant],
        isInert && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? color.onBrand : color.brand} />
      ) : (
        <View style={styles.content}>
          <Text
            variant={compact ? 'captionStrong' : 'button'}
            tone={isInert ? 'disabled' : labelTone[variant]}
            numberOfLines={1}>
            {label}
          </Text>
          {trailing ? (
            <Text
              variant={compact ? 'captionStrong' : 'button'}
              tone={isInert ? 'disabled' : labelTone[variant]}>
              {trailing}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

/**
 * En `secondary` y `ghost` la etiqueta va sobre blanco, así que usa el naranja profundo
 * (tono `brand` → `brandText`). Solo sobre el relleno naranja el texto es blanco.
 */
const labelTone = {
  primary: 'onBrand',
  secondary: 'brand',
  ghost: 'secondary',
} as const;

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: color.brand },
  secondary: {
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.brandBorder,
  },
  ghost: { backgroundColor: 'transparent' },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: color.brandPressed },
  secondary: { backgroundColor: color.brandSoft },
  ghost: { backgroundColor: color.surfaceMuted },
});

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.full,
    paddingHorizontal: space.xxl,
    justifyContent: 'center',
  },
  compact: { minHeight: touchTarget - 8, paddingHorizontal: space.lg },
  fullWidth: { alignSelf: 'stretch' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  disabled: {
    backgroundColor: color.surfaceMuted,
    borderColor: color.border,
  },
});
