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
type Tone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onBrand'
  | 'disabled';

/**
 * Los tonos apuntan a los tokens aptos para texto, no a los de relleno.
 *
 * `brand` resuelve al naranja **profundo** (5.18:1) y no al vivo (3.15:1): el vivo es un
 * color de relleno y como texto sobre blanco quedaría por debajo del mínimo. Que el mapeo
 * viva acá y no en cada pantalla es lo que hace que sea imposible equivocarse.
 *
 * `success` es el verde oscuro (4.86:1) y no el verde pleno (2.9:1), por lo mismo.
 */
const toneColor: Record<Tone, string> = {
  default: color.ink,
  secondary: color.inkSecondary,
  muted: color.inkMuted,
  brand: color.brandText,
  success: color.success,
  warning: color.warning,
  danger: color.danger,
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
