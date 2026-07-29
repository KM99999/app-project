/**
 * Constructor de pizza — Forno
 *
 * La pantalla donde se decide el ticket promedio y donde se pierde al usuario.
 *
 * Las cuatro decisiones que la definen:
 *
 * 1. **Un solo recorrido.** Cuatro secciones numeradas en un scroll, no cuatro pantallas.
 *    Cada transición de un wizard es una oportunidad de abandono (teardown, App A).
 * 2. **Se puede llegar a "Agregar al carrito" sin tocar nada.** Mediana y masa clásica
 *    vienen preseleccionadas por ser las más pedidas. El usuario que no quiere decidir,
 *    no decide.
 * 3. **El precio se actualiza a la vista.** La barra fija recalcula en cada toque y el
 *    recargo de cada opción se muestra al lado de la opción, no sumado al final.
 * 4. **Las secciones opcionales dicen "Opcional".** Es gratis y baja mucho la ansiedad
 *    del usuario con poca experiencia digital (supuesto S4).
 *
 * Acepta `?lineId=` para editar una línea del carrito en lugar de crear una nueva. Es lo
 * que permite repetir un pedido y ajustarlo antes de confirmar.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';

import { Button } from '@/design-system/button';
import { narrowContent } from '@/design-system/layout';
import { ChoiceCard, OptionRow, SectionHeader } from '@/design-system/primitives';
import { Screen, ScreenHeader, StickyBar, STICKY_BAR_CLEARANCE } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, radius, space } from '@/design-system/tokens';
import { formatPrice, formatSurcharge } from '@/domain/format';
import {
  ADDONS,
  CRUSTS,
  DEFAULT_CRUST_ID,
  DEFAULT_SIZE_ID,
  getPizza,
  getSize,
  PIZZAS,
  SIZES,
  TOPPINGS,
} from '@/domain/menu';
import { priceOfPizza } from '@/domain/pricing';
import type { Addon, CrustId, PizzaConfig, SizeId, ToppingSelection } from '@/domain/types';
import { useOrder } from '@/store/order-store';

/**
 * Pre-renderiza una página por pizza en el export estático.
 *
 * Sin esto, el export genera un único `constructor/[pizzaId].html`, que ningún hosting
 * estático sabe servir cuando alguien entra directo a `/constructor/napolitana` o
 * recarga la página estando en el Constructor: devuelve 404. Con esto se emite
 * `constructor/napolitana.html`, `constructor/muzzarella.html`, etc.
 *
 * Se resuelve en el build y no con reglas de reescritura del hosting, así funciona igual
 * en Vercel, en GitHub Pages o en cualquier servidor de archivos.
 */
export function generateStaticParams(): Record<string, string>[] {
  return PIZZAS.map((pizza) => ({ pizzaId: pizza.id }));
}

export default function BuilderScreen() {
  const router = useRouter();
  // `size` llega desde las iniciales de tamaño del menú (C · M · G): permite entrar al
  // Constructor con el tamaño ya elegido en lugar de tener que corregirlo acá.
  const { pizzaId, lineId, size: sizeParam } = useLocalSearchParams<{
    pizzaId: string;
    lineId?: string;
    size?: string;
  }>();
  const { addPizza, addAddon, replacePizza, lines } = useOrder();

  const pizza = getPizza(pizzaId);
  const editingLine = lineId ? lines.find((line) => line.id === lineId) : undefined;
  const editingConfig =
    editingLine && editingLine.kind === 'pizza' ? editingLine.config : undefined;

  // Prioridad: lo que se está editando, luego lo que pidió el menú, luego el default.
  const requestedSize = SIZES.find((option) => option.id === sizeParam)?.id;
  const [sizeId, setSizeId] = useState<SizeId>(
    editingConfig?.sizeId ?? requestedSize ?? DEFAULT_SIZE_ID
  );
  const [crustId, setCrustId] = useState<CrustId>(editingConfig?.crustId ?? DEFAULT_CRUST_ID);
  const [extras, setExtras] = useState<ToppingSelection[]>(editingConfig?.extras ?? []);
  const [quantity, setQuantity] = useState(editingLine?.quantity ?? 1);

  if (!pizza) {
    return (
      <Screen>
        <ScreenHeader title="Pizza no encontrada" onBack={() => router.back()} />
        <View style={styles.notFound}>
          <Text tone="secondary" center>
            No pudimos encontrar esa pizza en el menú.
          </Text>
        </View>
      </Screen>
    );
  }

  const config: PizzaConfig = { pizzaId: pizza.id, sizeId, crustId, extras };
  const breakdown = priceOfPizza(config);
  const total = breakdown.unit * quantity;
  const size = getSize(sizeId);

  const isExtraSelected = (toppingId: string) =>
    extras.some((selection) => selection.toppingId === toppingId);

  const toggleExtra = (toppingId: string) => {
    setExtras((current) => {
      if (current.some((selection) => selection.toppingId === toppingId)) {
        return current.filter((selection) => selection.toppingId !== toppingId);
      }
      // `half: 'whole'` es el único valor que emite la v1. Cuando FEATURES.halves pase a
      // true, acá entra el selector por lado y no cambia nada más de la pantalla.
      return [...current, { toppingId, half: 'whole' }];
    });
  };

  const handleSubmit = () => {
    if (editingLine) {
      replacePizza(editingLine.id, config, quantity);
    } else {
      addPizza(config, quantity);
    }
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader
        title={pizza.name}
        subtitle={editingLine ? 'Editando tu pedido' : undefined}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, narrowContent]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Image
            source={pizza.image}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
            accessibilityLabel={pizza.name}
          />

          <View style={styles.heroBody}>
            <Text variant="h2">{pizza.name}</Text>
            <Text variant="caption" tone="secondary">
              {pizza.description}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader step={1} title="Tamaño" />
          <View style={styles.sizeRow}>
            {SIZES.map((option) => (
              <ChoiceCard
                key={option.id}
                title={option.name}
                detail={option.detail}
                price={formatPrice(
                  priceOfPizza({ ...config, sizeId: option.id }).unit
                )}
                selected={option.id === sizeId}
                onPress={() => setSizeId(option.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader step={2} title="Masa" />
          <View style={styles.optionList}>
            {CRUSTS.map((option) => (
              <OptionRow
                key={option.id}
                label={option.name}
                description={option.description}
                trailing={formatSurcharge(option.price)}
                selected={option.id === crustId}
                onPress={() => setCrustId(option.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            step={3}
            title="Ingredientes extra"
            optional
            hint="Se suman a los que ya trae la pizza"
          />
          <View style={styles.optionList}>
            {TOPPINGS.map((topping) => (
              <OptionRow
                key={topping.id}
                control="checkbox"
                label={topping.name}
                // El recargo mostrado ya está escalado por el tamaño elegido: en una
                // grande el jamón cuesta más, y el usuario lo ve antes de tocarlo.
                trailing={formatSurcharge(
                  Math.round(topping.price * (size?.toppingMultiplier ?? 1))
                )}
                selected={isExtraSelected(topping.id)}
                onPress={() => toggleExtra(topping.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            step={4}
            title="Para acompañar"
            optional
            hint="Se agregan directo al carrito"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.addonRow}>
            {ADDONS.map((addon) => (
              <AddonCard key={addon.id} addon={addon} onPress={() => addAddon(addon.id)} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <StickyBar>
        <View style={styles.totalRow}>
          <View>
            <Text variant="caption" tone="secondary">
              Total
            </Text>
            <Text variant="h1" tone="brand">
              {formatPrice(total)}
            </Text>
          </View>

          {/* La cantidad vive acá y no arriba: es la última decisión, no la primera. */}
          <QuantityControl value={quantity} onChange={setQuantity} />
        </View>

        <Button
          label={editingLine ? 'Guardar cambios' : 'Agregar al carrito'}
          onPress={handleSubmit}
        />
      </StickyBar>
    </Screen>
  );
}

/** Stepper acotado: nunca baja de 1, porque acá todavía no existe una línea que borrar. */
function QuantityControl({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <View style={styles.quantity}>
      <Pressable
        onPress={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Quitar una unidad"
        style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}>
        <View style={[styles.barH, value <= 1 && styles.glyphDisabled]} />
      </Pressable>

      <Text variant="h3" style={styles.quantityValue}>
        {value}
      </Text>

      <Pressable
        onPress={() => onChange(value + 1)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Agregar una unidad"
        style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}>
        <View style={styles.barH} />
        <View style={styles.barV} pointerEvents="none" />
      </Pressable>
    </View>
  );
}

function AddonCard({ addon, onPress }: { addon: Addon; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Agregar ${addon.name} ${addon.detail}, ${formatPrice(addon.price)}`}
      style={({ pressed }) => [styles.addonCard, pressed && styles.pressed]}>
      {/* El tinte del producto queda de fondo: si la foto tarda en decodificar, el hueco
          no parpadea en gris. */}
      <Image
        source={addon.image}
        style={[styles.addonPhoto, { backgroundColor: addon.color }]}
        contentFit="cover"
        transition={160}
        accessibilityLabel={addon.name}
      />
      <Text variant="captionStrong" numberOfLines={1}>
        {addon.name}
      </Text>
      <Text variant="micro" tone="secondary">
        {addon.detail}
      </Text>
      <Text variant="captionStrong" tone="brand">
        +{formatPrice(addon.price)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: STICKY_BAR_CLEARANCE, gap: space.xxl },

  hero: {
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  // Foto a sangre y ancha: es lo que vende el producto antes de que empiece la
  // configuración. El nombre se repite bajo la imagen porque el encabezado se pierde de
  // vista apenas el usuario hace scroll.
  heroImage: { width: '100%', aspectRatio: 16 / 9, backgroundColor: color.surfaceMuted },
  heroBody: { padding: space.xl, gap: space.xs },

  section: { paddingHorizontal: space.xl },
  sizeRow: { flexDirection: 'row', gap: space.sm },
  optionList: { gap: space.sm },

  addonRow: { gap: space.sm, paddingRight: space.xl },
  addonCard: {
    width: 116,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 1,
  },
  // Foto circular, igual que en las filas del menú de Inicio. Antes era un cuadrado de
  // color plano: quedó de cuando estos productos todavía no tenían fotografía, y no se
  // actualizó al incorporarlas.
  addonPhoto: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
    marginBottom: space.sm,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
  },
  quantityButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  quantityValue: { minWidth: 24, textAlign: 'center' },
  barH: { width: 14, height: 2, borderRadius: 1, backgroundColor: color.ink },
  barV: { position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: color.ink },
  glyphDisabled: { backgroundColor: color.inkDisabled },

  pressed: { opacity: 0.6 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl },
});
