/**
 * Primitivas de interfaz — Forno
 *
 * Los componentes que se repiten entre pantallas. Cada uno lleva sus estados resueltos
 * (normal, presionado, seleccionado, deshabilitado) y sus roles de accesibilidad, para
 * que las pantallas se ocupen de composición y no de detalles de control.
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
        <Text variant="h2">
          {step !== undefined ? `${step} · ` : ''}
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
        <Text variant="caption" tone="secondary" style={styles.sectionHint}>
          {hint}
        </Text>
      ) : null}
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
        pressed && styles.optionRowPressed,
      ]}>
      <Indicator selected={selected} shape={control === 'radio' ? 'circle' : 'square'} />

      <View style={styles.optionText}>
        <Text variant={selected ? 'bodyStrong' : 'body'}>{label}</Text>
        {description ? (
          <Text variant="caption" tone="secondary">
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
        pressed && styles.optionRowPressed,
      ]}>
      <Text variant="bodyStrong" center tone={selected ? 'brand' : 'default'}>
        {title}
      </Text>
      <Text variant="micro" tone="secondary" center>
        {detail}
      </Text>
      <Text variant="captionStrong" center tone={selected ? 'brand' : 'default'}>
        {price}
      </Text>
      {selected ? <View style={styles.choiceCheck} /> : null}
    </Pressable>
  );
}

/**
 * Control segmentado, para elegir entre dos o tres modos excluyentes que cambian el
 * resto del formulario (delivery / retiro). Se prefiere a un switch porque nombra las
 * dos opciones: un switch obliga a inferir qué pasa cuando está apagado.
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
              pressed && styles.optionRowPressed,
            ]}>
            <Text variant={selected ? 'bodyStrong' : 'body'} tone={selected ? 'brand' : 'secondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Campo de texto con etiqueta. La etiqueta es persistente y no un placeholder: un
 *  placeholder que desaparece al escribir deja al usuario sin saber qué estaba llenando. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  optional = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  optional?: boolean;
  multiline?: boolean;
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
        style={[styles.input, multiline && styles.inputMultiline]}
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
  const size = compact ? 36 : touchTarget;

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
          pressed && styles.optionRowPressed,
        ]}>
        <View style={[styles.minusBar, value <= min && styles.stepperGlyphDisabled]} />
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
          pressed && styles.optionRowPressed,
        ]}>
        <View style={[styles.minusBar, value >= max && styles.stepperGlyphDisabled]} />
        <View
          style={[styles.plusBar, value >= max && styles.stepperGlyphDisabled]}
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
      <Text variant="micro" tone="onBrand">
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
}

/** Etiqueta informativa: "Envío gratis", "Más pedida". */
export function Chip({ label, tone = 'brand' }: { label: string; tone?: 'brand' | 'success' }) {
  return (
    <View style={[styles.chip, tone === 'success' ? styles.chipSuccess : styles.chipBrand]}>
      <Text variant="micro" tone={tone}>
        {label}
      </Text>
    </View>
  );
}

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
      <Text variant={strong ? 'bodyStrong' : 'body'} tone={strong ? 'default' : 'secondary'}>
        {label}
      </Text>
      <Text variant={strong ? 'h3' : 'body'} tone={tone ?? (strong ? 'default' : 'secondary')}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    padding: space.lg,
    ...elevation.card,
  },
  divider: { height: 1, backgroundColor: color.border },

  sectionHeader: { marginBottom: space.md, gap: space.xs },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  optionalTag: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  sectionHint: { marginTop: -2 },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: touchTarget + 8,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  optionRowSelected: { borderColor: color.brand, backgroundColor: color.brandSoft },
  optionRowPressed: { opacity: 0.7 },
  optionText: { flex: 1, gap: 2 },

  indicator: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: color.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorCircle: { borderRadius: radius.full },
  indicatorSquare: { borderRadius: 6 },
  indicatorSelected: { borderColor: color.brand, backgroundColor: color.brand },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: color.onBrand,
  },
  // Palito rotado con dos bordes: una tilde sin depender de una fuente de iconos.
  checkMark: {
    width: 6,
    height: 11,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: color.onBrand,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },

  choiceCard: {
    flex: 1,
    minHeight: 88,
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
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: color.brand,
  },

  segmented: {
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.md,
    // Superficie blanca con borde, y no `surfaceSunken`: el fondo de pantalla YA es
    // hundido, así que un track hundido desaparece y el control deja de leerse como
    // control. La pista tiene que contrastar con lo que hay detrás.
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  segmentSelected: { backgroundColor: color.brandSoft },

  field: { gap: space.xs },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    minHeight: touchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontSize: 16,
    color: color.ink,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  stepperButton: { alignItems: 'center', justifyContent: 'center' },
  stepperValue: { minWidth: 28, textAlign: 'center' },
  minusBar: { width: 14, height: 2, borderRadius: 1, backgroundColor: color.ink },
  plusBar: {
    position: 'absolute',
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: color.ink,
  },
  stepperGlyphDisabled: { backgroundColor: color.inkDisabled },

  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.full,
  },
  chipBrand: { backgroundColor: color.brandSoft },
  chipSuccess: { backgroundColor: color.successSoft },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs,
  },
});
