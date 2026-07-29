/**
 * Inicio — Forno
 *
 * Estructura tomada del formato de referencia de plataformas de pedido:
 *
 *   barra superior (marca · buscador · carrito)
 *   chips de categoría
 *   modo de entrega (delivery / retiro)
 *   tarjetas de momento de entrega
 *   banner de promoción
 *   "Más pedidas" en grilla de fotos
 *   menú completo, filtrable
 *
 * Las dos ideas de producto siguen mandando (ver docs/01-investigacion.md §4): la recompra
 * está sobre el pliegue para el cliente que ya sabe qué quiere, y el catálogo arranca
 * inmediatamente debajo, en el mismo scroll, para el que viene a explorar.
 *
 * Todo control de esta pantalla hace algo real. El buscador filtra, los chips filtran, y
 * el selector de entrega es el mismo `deliveryMode` que después usa el checkout para
 * calcular el envío. Lo único que no está construido —programar el pedido— se muestra
 * marcado como etapa 2 en lugar de fingir que funciona.
 */

import { Icon, type IconName } from '@/design-system/icon';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/design-system/button';
import { Bounded, useIsWide } from '@/design-system/layout';
import { Card, Chip, Divider, StatTile } from '@/design-system/primitives';
import { Screen } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, elevation, radius, space, touchTarget } from '@/design-system/tokens';
import { formatPrice, formatRelativeDay, pluralizeItems } from '@/domain/format';
import {
  ADDONS,
  CATEGORIES,
  DEFAULT_ADDRESS,
  ETA_MAX,
  ETA_MIN,
  FREE_DELIVERY_FROM,
  PIZZAS,
} from '@/domain/menu';
import { describeLine, priceFrom } from '@/domain/pricing';
import type { Addon, MenuCategory, Order, Pizza } from '@/domain/types';
import { useOrder } from '@/store/order-store';
import { useSectionNav, type SectionId } from '@/store/section-nav';

const USER_NAME = 'Carlos';
const BRAND = 'Forno';

type CategoryFilter = MenuCategory | 'todas';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();
  const { lastOrder, itemCount, deliveryMode, setDeliveryMode, repeatLastOrder, addAddon } =
    useOrder();
  const { request } = useSectionNav();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('todas');

  const scrollRef = useRef<ScrollView>(null);
  // Posición vertical de cada sección. Se llena con onLayout, así que no hay alturas
  // hardcodeadas que se desincronicen al cambiar el contenido.
  const offsets = useRef<Record<SectionId, number>>({ populares: 0, menu: 0 });

  useEffect(() => {
    if (!request) return;
    scrollRef.current?.scrollTo({
      y: Math.max(offsets.current[request.section] - space.lg, 0),
      animated: true,
    });
  }, [request]);

  const captureOffset = (section: SectionId) => (event: LayoutChangeEvent) => {
    offsets.current[section] = event.nativeEvent.layout.y;
  };

  const popular = PIZZAS.filter((pizza) => pizza.popular);

  const { pizzas, addons } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = (name: string, description: string) =>
      needle.length === 0 ||
      name.toLowerCase().includes(needle) ||
      description.toLowerCase().includes(needle);

    return {
      pizzas:
        category === 'todas' || category === 'pizzas'
          ? PIZZAS.filter((p) => matches(p.name, p.description))
          : [],
      addons: ADDONS.filter(
        (a) => (category === 'todas' || a.category === category) && matches(a.name, a.detail)
      ),
    };
  }, [query, category]);

  const nothingFound = pizzas.length === 0 && addons.length === 0;

  const handleRepeat = () => {
    if (repeatLastOrder()) router.push('/carrito');
  };

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* ── Barra superior ─────────────────────────────────────────────── */}
        <View style={[styles.appBar, { paddingTop: (isWide ? space.xl : insets.top) + space.md }]}>
          <Bounded>
            <View style={styles.appBarTop}>
              <View style={styles.brandRow}>
                <View style={styles.logo}>
                  <Text variant="bodyStrong" tone="onBrand">
                    {BRAND.charAt(0)}
                  </Text>
                </View>
                <Text variant={isWide ? 'h1' : 'h2'} numberOfLines={1}>
                  {BRAND}
                </Text>
              </View>

              <View style={styles.appBarActions}>
                {isWide ? <SearchField value={query} onChange={setQuery} /> : null}
                <Pressable
                  onPress={() => router.push('/carrito')}
                  accessibilityRole="button"
                  accessibilityLabel={
                    itemCount > 0 ? `Carrito, ${itemCount} productos` : 'Carrito, vacío'
                  }
                  style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}>
                  <Icon name="cart-outline" size={18} color={color.onBrand} />
                  <Text variant="captionStrong" tone="onBrand">
                    Carrito
                  </Text>
                  {itemCount > 0 ? (
                    <View style={styles.cartCount}>
                      <Text variant="micro" tone="brand" style={styles.cartCountText}>
                        {itemCount}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            </View>

            {!isWide ? (
              <View style={styles.mobileSearch}>
                <SearchField value={query} onChange={setQuery} />
              </View>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {CATEGORIES.map((item) => (
                <CategoryChip
                  key={item.id}
                  label={item.label}
                  selected={category === item.id}
                  onPress={() => setCategory(item.id)}
                />
              ))}
            </ScrollView>
          </Bounded>
        </View>

        <View style={styles.body}>
          <Bounded style={styles.stack}>
            {/* ── Modo de entrega ─────────────────────────────────────────── */}
            <View style={styles.modeSwitch}>
              <ModeTab
                icon="storefront-outline"
                label="Retiro"
                selected={deliveryMode === 'retiro'}
                onPress={() => setDeliveryMode('retiro')}
              />
              <ModeTab
                icon="bicycle-outline"
                label="Delivery"
                selected={deliveryMode === 'delivery'}
                onPress={() => setDeliveryMode('delivery')}
              />
            </View>

            <View style={[styles.fulfilmentRow, !isWide && styles.fulfilmentColumn]}>
              <FulfilmentCard
                icon="flash-outline"
                title="Lo antes posible"
                subtitle={`En ${ETA_MIN}-${ETA_MAX} min`}
                address={deliveryMode === 'delivery' ? DEFAULT_ADDRESS : 'Av. Corrientes 3400'}
                status="Disponible"
                selected
              />
              <FulfilmentCard
                icon="calendar-outline"
                title="Programar"
                subtitle="Elegí día y horario"
                address={deliveryMode === 'delivery' ? DEFAULT_ADDRESS : 'Av. Corrientes 3400'}
                comingSoon
              />
            </View>

            <PromoBanner mode={deliveryMode} />

            {/* ── Recompra ────────────────────────────────────────────────── */}
            {lastOrder ? <LastOrderCard order={lastOrder} onRepeat={handleRepeat} /> : null}

            {/* ── Más pedidas ─────────────────────────────────────────────── */}
            <View onLayout={captureOffset('populares')} style={styles.section}>
              <SectionTitle
                icon="flame"
                title="Las más pedidas"
                subtitle="Lo que más sale del horno"
              />
              <View style={styles.grid}>
                {popular.map((pizza) => (
                  <PizzaCard
                    key={pizza.id}
                    pizza={pizza}
                    wide={isWide}
                    onPress={() => router.push(`/constructor/${pizza.id}`)}
                  />
                ))}
              </View>
            </View>

            {/* ── Menú completo ───────────────────────────────────────────── */}
            <View onLayout={captureOffset('menu')} style={styles.section}>
              <SectionTitle
                icon="restaurant"
                title="Todo el menú"
                subtitle={
                  query || category !== 'todas'
                    ? `${pizzas.length + addons.length} resultados`
                    : `${PIZZAS.length} pizzas y ${ADDONS.length} acompañamientos`
                }
              />

              {nothingFound ? (
                <Card style={styles.noResults}>
                  <Text variant="bodyStrong" center>
                    Sin resultados
                  </Text>
                  <Text variant="caption" tone="secondary" center>
                    Probá con otra búsqueda o cambiá de categoría.
                  </Text>
                  <Button
                    label="Ver todo el menú"
                    variant="secondary"
                    fullWidth={false}
                    onPress={() => {
                      setQuery('');
                      setCategory('todas');
                    }}
                  />
                </Card>
              ) : (
                <View style={styles.grid}>
                  {pizzas.map((pizza) => (
                    <PizzaCard
                      key={pizza.id}
                      pizza={pizza}
                      wide={isWide}
                      onPress={() => router.push(`/constructor/${pizza.id}`)}
                    />
                  ))}
                  {addons.map((addon) => (
                    <AddonCard
                      key={addon.id}
                      addon={addon}
                      wide={isWide}
                      onPress={() => addAddon(addon.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </Bounded>
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ── Barra superior ───────────────────────────────────────────────────────── */

function SearchField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <View style={styles.search}>
      <Icon name="search" size={16} color={color.inkMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Buscar en el menú…"
        placeholderTextColor={color.inkMuted}
        accessibilityLabel="Buscar en el menú"
        style={styles.searchInput}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda">
          <Icon name="close-circle" size={16} color={color.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.categoryChip,
        selected && styles.categoryChipSelected,
        pressed && styles.pressed,
      ]}>
      <Text variant="caption" tone={selected ? 'onBrand' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ── Entrega ──────────────────────────────────────────────────────────────── */

function ModeTab({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.modeTab,
        selected && styles.modeTabSelected,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={17} color={selected ? color.brand : color.inkSecondary} />
      <Text variant="bodyStrong" tone={selected ? 'brand' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Tarjeta de momento de entrega.
 *
 * `comingSoon` la deja visible pero inerte. Programar el pedido no está construido, y
 * mostrar un control que no hace nada es peor que mostrarlo marcado: el usuario lo toca,
 * no pasa nada, y deja de confiar en el resto de la pantalla.
 */
function FulfilmentCard({
  icon,
  title,
  subtitle,
  address,
  status,
  selected = false,
  comingSoon = false,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  address: string;
  status?: string;
  selected?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <View
      style={[styles.fulfilmentCard, selected && styles.fulfilmentCardSelected]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: comingSoon }}>
      <View style={styles.fulfilmentTop}>
        <View style={[styles.fulfilmentIcon, selected && styles.fulfilmentIconSelected]}>
          <Icon
            name={icon}
            size={18}
            color={selected ? color.brand : color.inkSecondary}
          />
        </View>

        <View style={styles.fulfilmentText}>
          <Text variant="bodyStrong" tone={comingSoon ? 'secondary' : 'default'}>
            {title}
          </Text>
          <Text variant="micro" tone="secondary">
            {subtitle}
          </Text>
        </View>

        {selected ? (
          <View style={styles.radioOuter}>
            <View style={styles.radioInner} />
          </View>
        ) : comingSoon ? (
          <Chip label="Etapa 2" tone="neutral" />
        ) : null}
      </View>

      {status ? (
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text variant="micro" tone="success">
            {status}
          </Text>
        </View>
      ) : null}

      <Divider style={styles.fulfilmentDivider} />

      <View style={styles.addressRow}>
        <Icon name="location-outline" size={13} color={color.inkMuted} />
        <Text variant="micro" tone="secondary" numberOfLines={1} style={styles.addressText}>
          {address}
        </Text>
      </View>
    </View>
  );
}

/** Comunica una regla de negocio real, no una promoción inventada. Ver `pricing.ts`. */
function PromoBanner({ mode }: { mode: 'delivery' | 'retiro' }) {
  const isPickup = mode === 'retiro';

  return (
    <View style={styles.promo}>
      <View style={styles.promoIcon}>
        <Icon name="pricetag" size={18} color={color.brand} />
      </View>

      <View style={styles.promoText}>
        <Text variant="bodyStrong">
          {isPickup ? 'Retirando no pagás envío' : `Envío gratis desde ${formatPrice(FREE_DELIVERY_FROM)}`}
        </Text>
        <Text variant="micro" tone="secondary">
          {isPickup
            ? 'El total no lleva costo de entrega'
            : 'Se aplica solo al llegar al monto, sin cupón'}
        </Text>
      </View>

      <View style={styles.promoBadge}>
        <Text variant="micro" tone="onBrand">
          {isPickup ? 'SIN ENVÍO' : 'GRATIS'}
        </Text>
      </View>
    </View>
  );
}

/* ── Recompra ─────────────────────────────────────────────────────────────── */

function LastOrderCard({ order, onRepeat }: { order: Order; onRepeat: () => void }) {
  const summary = order.lines.map(describeLine).filter(Boolean).join(' · ');
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Card style={styles.lastOrderCard}>
      <View style={styles.lastOrderHeader}>
        <Chip label="Tu último pedido" />
        <Text variant="micro" tone="muted">
          {formatRelativeDay(order.placedAt)}
        </Text>
      </View>

      <Text variant="h3" numberOfLines={2}>
        {summary}
      </Text>

      {/* El dato manda y la etiqueta acompaña: responde "¿qué estoy por repetir?" de un vistazo. */}
      <View style={styles.statsRow}>
        <StatTile value={String(itemCount)} label={pluralizeItems(itemCount).split(' ')[1]} />
        <View style={styles.statDivider} />
        <StatTile value={formatPrice(order.total)} label="Total" tone="brand" />
        <View style={styles.statDivider} />
        <StatTile value={`${ETA_MIN}-${ETA_MAX}'`} label="Minutos" />
      </View>

      <Button
        label="Repetir pedido"
        onPress={onRepeat}
        accessibilityHint="Carga el pedido anterior en el carrito para que puedas revisarlo"
      />
    </Card>
  );
}

/* ── Catálogo ─────────────────────────────────────────────────────────────── */

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionIcon}>
        <Icon name={icon} size={17} color={color.brand} />
      </View>
      <View>
        <Text variant="h2">{title}</Text>
        <Text variant="micro" tone="secondary">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function PizzaCard({
  pizza,
  onPress,
  wide,
}: {
  pizza: Pizza;
  onPress: () => void;
  wide: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pizza.name}. ${pizza.description}. Desde ${formatPrice(priceFrom(pizza.id))}`}
      style={({ pressed }) => [
        styles.productCard,
        wide ? styles.productCardWide : styles.productCardNarrow,
        pressed && styles.pressed,
      ]}>
      <View style={styles.photoWrap}>
        <Image
          source={pizza.image}
          style={styles.photo}
          contentFit="cover"
          transition={180}
          accessibilityLabel={pizza.name}
        />
        {/* Precio sobre la foto, como en la referencia: se compara el catálogo sin tener
            que bajar la vista al pie de cada tarjeta. */}
        <View style={styles.pricePill}>
          <Text variant="captionStrong">{formatPrice(priceFrom(pizza.id))}</Text>
        </View>
      </View>

      <View style={styles.productBody}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {pizza.name}
        </Text>
        <Text variant="micro" tone="secondary" numberOfLines={2} style={styles.productDesc}>
          {pizza.description}
        </Text>

        <View style={styles.addButton} pointerEvents="none">
          <Icon name="add" size={20} color={color.onBrand} />
        </View>
      </View>
    </Pressable>
  );
}

/** Bebidas, acompañamientos y postres. Se agregan directo al carrito, sin configurar. */
function AddonCard({
  addon,
  onPress,
  wide,
}: {
  addon: Addon;
  onPress: () => void;
  wide: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Agregar ${addon.name} ${addon.detail}, ${formatPrice(addon.price)}`}
      style={({ pressed }) => [
        styles.productCard,
        wide ? styles.productCardWide : styles.productCardNarrow,
        pressed && styles.pressed,
      ]}>
      {/* El tinte queda de respaldo detrás de la foto: si tarda en decodificar, el hueco
          no parpadea en gris. */}
      <View style={[styles.photoWrap, { backgroundColor: addon.color }]}>
        <Image
          source={addon.image}
          style={styles.photo}
          contentFit="cover"
          transition={180}
          accessibilityLabel={addon.name}
        />
        <View style={styles.pricePill}>
          <Text variant="captionStrong">{formatPrice(addon.price)}</Text>
        </View>
      </View>

      <View style={styles.productBody}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {addon.name}
        </Text>
        <Text variant="micro" tone="secondary" numberOfLines={2} style={styles.productDesc}>
          {addon.detail}
        </Text>

        <View style={styles.addButton} pointerEvents="none">
          <Icon name="add" size={20} color={color.onBrand} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.huge },

  /* Barra superior */
  appBar: {
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
  },
  appBarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexShrink: 1 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarActions: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 40,
    paddingHorizontal: space.lg,
    borderRadius: radius.full,
    backgroundColor: color.brand,
  },
  cartCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: color.onBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: { lineHeight: 16 },

  mobileSearch: { marginTop: space.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 40,
    minWidth: 200,
    paddingHorizontal: space.lg,
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
    borderWidth: 1,
    borderColor: color.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: color.ink, outlineStyle: 'none' } as object,

  chipRow: { gap: space.sm, paddingTop: space.lg, paddingRight: space.xl },
  categoryChip: {
    paddingHorizontal: space.lg,
    height: 34,
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
    borderWidth: 1,
    borderColor: color.border,
  },
  categoryChipSelected: { backgroundColor: color.brand, borderColor: color.brand },

  body: { padding: space.xl },
  stack: { gap: space.xl },

  /* Entrega */
  modeSwitch: {
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    borderWidth: 1,
    borderColor: color.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: touchTarget - 8,
    borderRadius: radius.sm,
  },
  modeTabSelected: { backgroundColor: color.surface, ...elevation.card },

  fulfilmentRow: { flexDirection: 'row', gap: space.lg },
  fulfilmentColumn: { flexDirection: 'column' },
  fulfilmentCard: {
    flex: 1,
    padding: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    gap: space.sm,
  },
  fulfilmentCardSelected: { borderColor: color.brand, borderWidth: 2 },
  fulfilmentTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  fulfilmentIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fulfilmentIconSelected: { backgroundColor: color.brandSoft },
  fulfilmentText: { flex: 1, gap: 1 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: radius.full,
    backgroundColor: color.brand,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: color.successFill,
  },
  fulfilmentDivider: { marginTop: space.xs },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  addressText: { flexShrink: 1 },

  /* Promoción */
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: color.brandSoft,
    borderWidth: 1,
    borderColor: color.brandBorder,
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1, gap: 1 },
  promoBadge: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs2,
    borderRadius: radius.xs,
    backgroundColor: color.brand,
  },

  /* Recompra */
  lastOrderCard: { gap: space.md, ...elevation.raised },
  lastOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: color.surfaceSunken,
    borderWidth: 1,
    borderColor: color.border,
  },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: color.border },

  /* Secciones */
  section: { gap: space.lg },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Tarjetas de producto */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  productCard: {
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    overflow: 'hidden',
    ...elevation.card,
  },
  // Tres columnas en escritorio, una en móvil. El `gap` de 16 se descuenta del ancho.
  productCardWide: { width: '31.8%' },
  productCardNarrow: { width: '100%' },
  photoWrap: { width: '100%', aspectRatio: 16 / 10, backgroundColor: color.surfaceMuted },
  photo: { width: '100%', height: '100%' },
  addonArt: { alignItems: 'center', justifyContent: 'center' },
  pricePill: {
    position: 'absolute',
    left: space.md,
    bottom: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.xs2,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    ...elevation.card,
  },
  productBody: { padding: space.lg, gap: 2 },
  productDesc: { paddingRight: 44 },
  // Superpuesto al pie de la tarjeta, como en la referencia. `pointerEvents: none`: el
  // área táctil es la tarjeta entera, así que el botón es afordancia visual, no un blanco
  // chico que hay que acertar.
  addButton: {
    position: 'absolute',
    right: space.lg,
    bottom: space.lg,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noResults: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },

  pressed: { opacity: 0.75 },
});
