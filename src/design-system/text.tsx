/**
 * Texto — Forno
 *
 * Único punto de entrada tipográfico de la app. Ninguna pantalla usa `<Text>` de React
 * Native directamente: así la escala se mantiene consistente y cambiarla es cambiar
 * `type` en tokens.ts, no buscar tamaños sueltos por el proyecto.
 */

import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { color, type } from './tokens';

type Variant = keyof typeof type;
type Tone = 'default' | 'secondary' | 'muted' | 'brand' | 'success' | 'warning' | 'onBrand' | 'disabled';

const toneColor: Record<Tone, string> = {
  default: color.ink,
  secondary: color.inkSecondary,
  muted: color.inkMuted,
  brand: color.brand,
  success: color.success,
  warning: color.warning,
  onBrand: color.onBrand,
  disabled: color.inkDisabled,
};

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
};

export function Text({
  variant = 'body',
  tone = 'default',
  center = false,
  style,
  ...rest
}: TextProps) {
  const base = type[variant] as TextStyle;
  return (
    <RNText
      style={[base, { color: toneColor[tone] }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
