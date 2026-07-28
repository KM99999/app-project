/**
 * Primitivas de interfaz — Forno
 *
 * Los componentes que se repiten entre pantallas, en el lenguaje visual del panel de
 * administración: superficies blancas, radios de 10, bordes finos y sombras muy tenues.
 *
 * Cada uno lleva sus estados resueltos (normal, presionado, seleccionado, deshabilitado)
 * y sus roles de accesibilidad, para que las pantallas se ocupen de composición.
 */

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { Text } from './text';
import { color, elevation, radius, space, touchTarget } from './tokens';

/* ── Contenedores ─────────────────────────────────────────────────────────── */

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

/** Tarjeta sin relleno propio, para cuando el contenido maneja su propio padding. */
export function CardBare({ style, ...rest }: ViewProps) {
  return <View style={[styles.cardBare, style]} {...rest} />;
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

/**
 * Encabezado de sección numerado.
 *
 * El número es deliberado: es la mitigación del supuesto S4 (usuarios con poca
 * experiencia digital frente a un scroll único). Da la sensación de progreso que
 * normalmente aporta un wizard, sin pagar el costo de fragmentar la pantalla.
 */
export function SectionHeader({
  step,
  title,
  optional = false,
  hint,
}: {
  step?: number;
  title: string;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {/* El número va en su propia cápsula índigo: ancla la vista al recorrer el
            scroll y hace legible de un vistazo en qué paso está el usuario. */}
        {step !== undefined ? (
          <View style={styles.stepBadge}>
            <Text variant="micro" tone="brand">
              {step}
            </Text>
          </View>
        ) : null}

        <Text variant="h3" style={styles.sectionTitle}>
          {title}
        </Text>

        {optional ? (
          <View style={styles.optionalTag}>
            <Text variant="micro" tone="secondary">
              Opcional
            </Text>
          </View>
        ) : null}
      </View>

      {hint ? (
        <Text variant="caption" tone="secondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/* ── Resumen tipo panel ───────────────────────────────────────────────────── */

/**
 * Tarjeta de métrica: número grande arriba, etiqueta chica abajo.
 *
 * Es el elemento de firma del design system del panel. Acá se usa para resumir el pedido
 * (productos, tiempo estimado, total) con la misma densidad y jerarquía que un tablero de
 * ventas: el dato manda y la etiqueta acompaña, nunca al revés.
 */
export function StatTile({
  value,
  label,
  tone = 'default',
}: {
  value: string;
  label: string;
  tone?: 'default' | 'brand' | 'success';
}) {
  return (
    <View style={styles.statTile}>
      <Text
        variant="metric"
        tone={tone === 'default' ? 'default' : tone}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {value}
      </Text>
      <Text variant="micro" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ── Controles de selección ───────────────────────────────────────────────── */

/**
 * Fila de opción, para selección única (`radio`) o múltiple (`checkbox`).
 *
 * El estado seleccionado se comunica por tres canales —color de fondo, color de borde y
 * la marca del indicador— y nunca solo por color: una fila que se distingue del resto
 * únicamente por el tinte es invisible para buena parte de los usuarios con daltonismo.
 */
export function OptionRow({
  label,
  description,
  trailing,
  selected,
  onPress,
  control = 'radio',
}: {
  label: string;
  description?: string;
  trailing?: string;
  selected: boolean;
  onPress: () => void;
  control?: 'radio' | 'checkbox';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={control}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={trailing ? `${label}, ${trailing}` : label}
      style={({ pressed }) => [
        styles.optionRow,
        selected && styles.optionRowSelected,
        pressed && styles.pressed,
      ]}>
      <Indicator selected={selected} shape={control === 'radio' ? 'circle' : 'square'} />

      <View style={styles.optionText}>
        <Text variant={selected ? 'bodyStrong' : 'body'}>{label}</Text>
        {description ? (
          <Text variant="micro" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>

      {trailing ? (
        <Text variant="captionStrong" tone={selected ? 'brand' : 'secondary'}>
          {trailing}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Indicator({ selected, shape }: { selected: boolean; shape: 'circle' | 'square' }) {
  return (
    <View
      style={[
        styles.indicator,
        shape === 'circle' ? styles.indicatorCircle : styles.indicatorSquare,
        selected && styles.indicatorSelected,
      ]}>
      {selected ? (
        shape === 'circle' ? (
          <View style={styles.indicatorDot} />
        ) : (
          <View style={styles.checkMark} />
        )
      ) : null}
    </View>
  );
}

/**
 * Tarjeta de elección, para opciones que se comparan de un vistazo (los tamaños).
 *
 * El precio va **dentro de la tarjeta**, en el punto exacto de la decisión. Es la
 * contrapartida directa del punto de fuga #1: el usuario no debería enterarse de lo que
 * cuesta una grande recién en el total.
 */
export function ChoiceCard({
  title,
  detail,
  price,
  selected,
  onPress,
}: {
  title: string;
  detail: string;
  price: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}, ${detail}, ${price}`}
      style={({ pressed }) => [
        styles.choiceCard,
        selected && styles.choiceCardSelected,
        pressed && styles.pressed,
      ]}>
      <Text variant="captionStrong" center tone={selected ? 'brand' : 'default'}>
        {title}
      </Text>
      <Text variant="micro" tone="secondary" center>
        {detail}
      </Text>
      <Text variant="bodyStrong" center tone={selected ? 'brand' : 'default'}>
        {price}
      </Text>
      {selected ? (
        <View style={styles.choiceCheck}>
          <View style={styles.choiceCheckMark} />
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Control segmentado, para elegir entre modos excluyentes que cambian el resto del
 * formulario (delivery / retiro). Se prefiere a un switch porque nombra las dos opciones:
 * un switch obliga a inferir qué pasa cuando está apagado.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
              pressed && styles.pressed,
            ]}>
            <Text
              variant={selected ? 'captionStrong' : 'caption'}
              tone={selected ? 'onBrand' : 'secondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Campo de texto con etiqueta persistente — no un placeholder que se borra al escribir. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  optional = false,
  multiline = false,
  invalid = false,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  optional?: boolean;
  multiline?: boolean;
  invalid?: boolean;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text variant="captionStrong" tone="secondary">
          {label}
        </Text>
        {optional ? (
          <Text variant="micro" tone="muted">
            Opcional
          </Text>
        ) : null}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.inkMuted}
        multiline={multiline}
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.inputMultiline, invalid && styles.inputInvalid]}
      />
    </View>
  );
}

/* ── Cantidad ─────────────────────────────────────────────────────────────── */

/**
 * Selector de cantidad.
 *
 * En 1, el botón "–" no se deshabilita: elimina la línea. Deshabilitarlo obligaría al
 * usuario a buscar un botón de borrar en otro lado para hacer lo que ya está intentando.
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 20,
  compact = false,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}) {
  const size = compact ? 34 : touchTarget;

  return (
    <View style={styles.stepper} accessibilityLabel={`Cantidad: ${value}`}>
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={value <= min}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Quitar uno"
        style={({ pressed }) => [
          styles.stepperButton,
          { width: size, height: size },
          pressed && styles.pressed,
        ]}>
        <View style={[styles.barH, value <= min && styles.glyphDisabled]} />
      </Pressable>

      <Text variant="bodyStrong" style={styles.stepperValue}>
        {value}
      </Text>

      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={value >= max}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Agregar uno"
        style={({ pressed }) => [
          styles.stepperButton,
          { width: size, height: size },
          pressed && styles.pressed,
        ]}>
        <View style={[styles.barH, value >= max && styles.glyphDisabled]} />
        <View
          style={[styles.barV, value >= max && styles.glyphDisabled]}
          pointerEvents="none"
        />
      </Pressable>
    </View>
  );
}

/* ── Señales ──────────────────────────────────────────────────────────────── */

/** Contador sobre el icono del carrito. Se oculta solo cuando el carrito está vacío. */
export function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text variant="micro" tone="onBrand" style={styles.badgeText}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
}

/**
 * Etiqueta informativa: "Envío gratis", "Más pedida".
 *
 * `alignSelf: 'flex-start'` evita que la píldora se estire a lo ancho del contenedor,
 * pero también gana sobre el `alignItems` del padre. Por eso existe `style`: en un bloque
 * centrado hay que poder devolverla al centro.
 */
export function Chip({
  label,
  tone = 'brand',
  style,
}: {
  label: string;
  tone?: 'brand' | 'success' | 'neutral';
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.chip, chipTone[tone], style]}>
      <Text variant="micro" tone={tone === 'neutral' ? 'secondary' : tone}>
        {label}
      </Text>
    </View>
  );
}

const chipTone = StyleSheet.create({
  brand: { backgroundColor: color.brandSoft },
  success: { backgroundColor: color.successSoft },
  neutral: { backgroundColor: color.surfaceMuted },
});

/** Fila del desglose de precios. `strong` para el total. */
export function PriceRow({
  label,
  value,
  strong = false,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: 'success';
}) {
  return (
    <View style={styles.priceRow}>
      <Text variant={strong ? 'bodyStrong' : 'caption'} tone={strong ? 'default' : 'secondary'}>
        {label}
      </Text>
      <Text
        variant={strong ? 'h3' : 'captionStrong'}
        tone={tone ?? (strong ? 'default' : 'default')}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    padding: space.lg,
    ...elevation.card,
  },
  cardBare: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    overflow: 'hidden',
    ...elevation.card,
  },
  divider: { height: 1, backgroundColor: color.border },

  sectionHeader: { marginBottom: space.md, gap: space.xs },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  sectionTitle: { flexShrink: 1 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionalTag: {
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },

  statTile: {
    flex: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    alignItems: 'center',
    gap: 2,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: touchTarget + 6,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  optionRowSelected: { borderColor: color.brand, backgroundColor: color.brandSoft },
  pressed: { opacity: 0.65 },
  optionText: { flex: 1, gap: 1 },

  indicator: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorCircle: { borderRadius: radius.full },
  indicatorSquare: { borderRadius: radius.xs },
  indicatorSelected: { borderColor: color.brand, backgroundColor: color.brand },
  indicatorDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: color.onBrand,
  },
  // Palito rotado con dos bordes: una tilde sin depender de una fuente de iconos.
  checkMark: {
    width: 5,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: color.onBrand,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },

  choiceCard: {
    flex: 1,
    minHeight: 92,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  choiceCardSelected: {
    borderColor: color.brand,
    borderWidth: 2,
    backgroundColor: color.brandSoft,
  },
  choiceCheck: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCheckMark: {
    width: 4,
    height: 8,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: color.onBrand,
    transform: [{ rotate: '45deg' }],
    marginTop: -1,
  },

  segmented: {
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    borderWidth: 1,
    borderColor: color.border,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget - 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  // Relleno índigo pleno en el segmento activo: es lo que hace que el control se lea
  // como un interruptor de modo y no como dos botones sueltos.
  segmentSelected: { backgroundColor: color.brand },

  field: { gap: space.xs2 },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    minHeight: touchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderStrong,
    backgroundColor: color.surface,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontSize: 15,
    color: color.ink,
  },
  inputMultiline: { minHeight: 84, textAlignVertical: 'top' },
  inputInvalid: { borderColor: color.danger },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  stepperButton: { alignItems: 'center', justifyContent: 'center' },
  stepperValue: { minWidth: 26, textAlign: 'center' },
  barH: { width: 13, height: 1.5, borderRadius: 1, backgroundColor: color.ink },
  barV: {
    position: 'absolute',
    width: 1.5,
    height: 13,
    borderRadius: 1,
    backgroundColor: color.ink,
  },
  glyphDisabled: { backgroundColor: color.inkDisabled },

  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.surface,
  },
  badgeText: { lineHeight: 14 },

  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs2,
  },
});
