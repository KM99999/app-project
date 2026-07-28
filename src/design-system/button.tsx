/**
 * Botón — Forno
 *
 * Tres jerarquías, un solo componente. Estados: normal, presionado, deshabilitado.
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
            variant="bodyStrong"
            tone={isInert ? 'disabled' : labelTone[variant]}
            numberOfLines={1}>
            {label}
          </Text>
          {trailing ? (
            <Text variant="bodyStrong" tone={isInert ? 'disabled' : labelTone[variant]}>
              {trailing}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const labelTone = {
  primary: 'onBrand',
  secondary: 'brand',
  ghost: 'secondary',
} as const;

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: color.brand },
  secondary: { backgroundColor: color.brandSoft, borderWidth: 1, borderColor: color.brand },
  ghost: { backgroundColor: 'transparent' },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: color.brandPressed },
  secondary: { backgroundColor: '#F8DDD6' },
  ghost: { backgroundColor: color.surfaceSunken },
});

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  disabled: { backgroundColor: color.surfaceSunken, borderColor: color.border },
});
