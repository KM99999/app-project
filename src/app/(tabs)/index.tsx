/**
 * Inicio — Forno
 *
 * Estructura tomada de la referencia elegida por el cliente (*Landing Page #DailyUi 003*,
 * de Anjali Aakanchha):
 *
 *   panel de portada con foto, titular amarillo y llamada a la acción
 *   buscador de línea
 *   tarjeta de menú con pestañas (Veg · No veg · Para compartir)
 *   filas de producto con foto circular y los tamaños abreviados
 *
 * En escritorio va a dos columnas, como el original: menú a la izquierda, portada a la
 * derecha. En móvil se apila, con la portada arriba.
 *
 * Las dos ideas de producto siguen mandando (ver docs/01-investigacion.md §4): la recompra
 * está sobre el pliegue para el cliente que ya sabe qué quiere, y el menú completo queda
 * inmediatamente disponible para el que viene a explorar.
 *
 * Todo control hace algo real: el buscador filtra, las pestañas filtran, el selector de
 * entrega es el mismo `deliveryMode` que usa el checkout, y cada letra de tamaño abre el
 * Constructor con ese tamaño ya elegido.
 */

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
import { FLOATING_BAR_CLEARANCE } from '@/design-system/floating-tab-bar';
import { Icon } from '@/design-system/icon';
import {
  Bounded,
  useIsExtraWide,
  useIsWide,
  useWindowCenteringPad,
} from '@/design-system/layout';
import { Chip } from '@/design-system/primitives';
import { Screen } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, elevation, radius, space, touchTarget } from '@/design-system/tokens';
import { formatPrice, formatRelativeDay } from '@/domain/format';
import {
  ADDONS,
  DEFAULT_ADDRESS,
  ETA_MAX,
  ETA_MIN,
  FREE_DELIVERY_FROM,
  getPizza,
  PIZZAS,
  SIZES,
} from '@/domain/menu';
import { describeLine, priceFrom } from '@/domain/pricing';
import type { Addon, Order, Pizza } from '@/domain/types';
import { useOrder } from '@/store/order-store';
import { useSectionNav, type SectionId } from '@/store/section-nav';

const BRAND = 'Forno';

/** Foto de portada. La más apetecible del catálogo: es lo primero que se ve. */
const HERO_IMAGE = getPizza('cuatro-quesos')?.image;

type MenuTab = 'veg' | 'noveg' | 'sides';

const TABS: { id: MenuTab; label: string }[] = [
  { id: 'veg', label: 'Veg' },
  { id: 'noveg', label: 'No veg' },
  { id: 'sides', label: 'Para compartir' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();
  const isXWide = useIsExtraWide();
  const centeringPad = useWindowCenteringPad();
  const { lastOrder, deliveryMode, setDeliveryMode, repeatLastOrder, addAddon } = useOrder();
  const { request } = useSectionNav();

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<MenuTab>('veg');

  const scrollRef = useRef<ScrollView>(null);
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

  const { pizzas, addons } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const hit = (a: string, b: string) =>
      needle.length === 0 ||
      a.toLowerCase().includes(needle) ||
      b.toLowerCase().includes(needle);

    // El buscador atraviesa las pestañas: buscar "coca" estando en Veg no debería no
    // devolver nada. Filtra dentro de la pestaña salvo que haya texto, y entonces busca
    // en todo el menú.
    if (needle.length > 0) {
      return {
        pizzas: PIZZAS.filter((p) => hit(p.name, p.description)),
        addons: ADDONS.filter((a) => hit(a.name, a.detail)),
      };
    }

    return {
      pizzas: tab === 'sides' ? [] : PIZZAS.filter((p) => p.vegetarian === (tab === 'veg')),
      addons: tab === 'sides' ? ADDONS : [],
    };
  }, [query, tab]);

  const nothingFound = pizzas.length === 0 && addons.length === 0;

  const handleRepeat = () => {
    if (repeatLastOrder()) router.push('/carrito');
  };

  const openPizza = (pizzaId: string, sizeId?: string) => {
    router.push(sizeId ? `/constructor/${pizzaId}?size=${sizeId}` : `/constructor/${pizzaId}`);
  };

  const goToMenu = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(offsets.current.menu - space.lg, 0),
      animated: true,
    });
  };

  const hero = (
    <HeroPanel
      wide={isWide}
      deliveryMode={deliveryMode}
      onOrder={goToMenu}
    />
  );

  const menuPanel = (
    <View style={styles.column} onLayout={captureOffset('menu')}>
      <SearchField value={query} onChange={setQuery} />

      <ModeSwitch mode={deliveryMode} onChange={setDeliveryMode} />

      {lastOrder ? (
        <View onLayout={captureOffset('populares')}>
          <LastOrderCard order={lastOrder} onRepeat={handleRepeat} />
        </View>
      ) : null}

      <View style={styles.menuCard}>
        <Text variant="h1" tone="brand">
          Menú
        </Text>

        <View style={styles.tabs}>
          {TABS.map((item) => (
            <MenuTabButton
              key={item.id}
              label={item.label}
              selected={query.length === 0 && tab === item.id}
              onPress={() => {
                setQuery('');
                setTab(item.id);
              }}
            />
          ))}
        </View>

        {nothingFound ? (
          <View style={styles.noResults}>
            <Text variant="bodyStrong" center>
              Sin resultados
            </Text>
            <Text variant="caption" tone="secondary" center>
              Probá con otro nombre o mirá otra pestaña.
            </Text>
          </View>
        ) : (
          <View style={[styles.rows, isXWide && styles.rowsGrid]}>
            {pizzas.map((pizza) => (
              <PizzaRow
                key={pizza.id}
                pizza={pizza}
                twoUp={isXWide}
                onOpen={(sizeId) => openPizza(pizza.id, sizeId)}
              />
            ))}
            {addons.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                twoUp={isXWide}
                onAdd={() => addAddon(addon.id)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: (isWide ? space.xxl : insets.top) + space.lg,
            // Espejo del riel, para que el bloque quede centrado contra la ventana.
            paddingRight: space.lg + centeringPad,
            // En escritorio no hay píldora flotante que esquivar, así que no hace falta
            // reservarle lugar. Dejar esa reserva desbalanceaba el centrado vertical:
            // sobraba más abajo que arriba.
            paddingBottom: isWide ? space.xxl + space.lg : FLOATING_BAR_CLEARANCE,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Bounded>
          {!isWide ? (
            <View style={styles.brandRow}>
              <Icon name="pizza" size={26} color={color.brandText} />
              <Text variant="h2">
                {BRAND} <Text variant="h2" tone="brand">Pizza</Text>
              </Text>
            </View>
          ) : null}

          {isWide ? (
            // Dos columnas, como el original: menú a la izquierda, portada a la derecha.
            <View style={styles.columns}>
              {/* En monitores anchos el menú lleva dos columnas de filas, así que necesita
                  más ancho que la portada; por debajo de ese corte se reparten casi igual. */}
              <View style={[styles.columnLeft, isXWide && styles.columnLeftXWide]}>
                {menuPanel}
              </View>
              <View style={[styles.columnRight, isXWide && styles.columnRightXWide]}>
                {hero}
              </View>
            </View>
          ) : (
            <View style={styles.column}>
              {hero}
              {menuPanel}
            </View>
          )}
        </Bounded>
      </ScrollView>
    </Screen>
  );
}

/* ── Portada ──────────────────────────────────────────────────────────────── */

/**
 * Panel de portada: foto a sangre, titular amarillo y llamada a la acción.
 *
 * El amarillo funciona como color de texto **solo acá**, sobre el velo oscuro de la foto.
 * Sobre blanco daría 1.4:1 y sería invisible. El velo no es decorativo: es lo que hace que
 * tanto el titular como el texto de apoyo sean legibles sin depender de qué zona de la
 * fotografía les toque detrás.
 */
function HeroPanel({
  wide,
  deliveryMode,
  onOrder,
}: {
  wide: boolean;
  deliveryMode: 'delivery' | 'retiro';
  onOrder: () => void;
}) {
  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      {HERO_IMAGE ? (
        <Image source={HERO_IMAGE} style={styles.heroImage} contentFit="cover" transition={220} />
      ) : null}
      <View style={styles.heroScrim} />

      <View style={styles.heroContent}>
        <Text variant={wide ? 'display' : 'h1'} style={styles.heroTitle}>
          EL LUGAR PARA TU AMOR POR LA PIZZA
        </Text>

        <View style={styles.heroFoot}>
          <Text variant="bodyStrong" tone="onDark">
            {deliveryMode === 'delivery'
              ? `Envío gratis desde ${formatPrice(FREE_DELIVERY_FROM)}`
              : 'Retiro en el local, sin costo de envío'}
          </Text>
          <Text variant="caption" tone="onDark" style={styles.heroSub}>
            Delivery y retiro · {ETA_MIN}-{ETA_MAX} min
          </Text>

          <Button label="Pedir online" onPress={onOrder} fullWidth={false} style={styles.heroButton} />
        </View>
      </View>
    </View>
  );
}

/* ── Controles ────────────────────────────────────────────────────────────── */

/** Buscador de línea, como el de la referencia: sin caja, solo un borde inferior. */
function SearchField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <View style={styles.search}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Buscar pizza, bebida, postre…"
        placeholderTextColor={color.inkMuted}
        accessibilityLabel="Buscar en el menú"
        style={styles.searchInput}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda">
          <Icon name="close-circle" size={20} color={color.inkMuted} />
        </Pressable>
      ) : (
        <Icon name="search" size={20} color={color.ink} />
      )}
    </View>
  );
}

/** Pestaña con subrayado amarillo, como en la referencia. */
function MenuTabButton({
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
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <Text variant={selected ? 'bodyStrong' : 'body'} tone={selected ? 'default' : 'secondary'}>
        {label}
      </Text>
      {/* El subrayado se dibuja siempre y cambia de color: así la fila no salta de alto
          cuando cambia la pestaña activa. */}
      <View style={[styles.tabUnderline, selected && styles.tabUnderlineActive]} />
    </Pressable>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: 'delivery' | 'retiro';
  onChange: (next: 'delivery' | 'retiro') => void;
}) {
  return (
    <View style={styles.modeSwitch}>
      {(
        [
          { id: 'delivery' as const, label: 'Delivery', icon: 'bicycle' as const },
          { id: 'retiro' as const, label: 'Retiro', icon: 'storefront' as const },
        ]
      ).map((option) => {
        const selected = mode === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [
              styles.modeTab,
              selected && styles.modeTabSelected,
              pressed && styles.pressed,
            ]}>
            <Icon
              name={option.icon}
              size={17}
              color={selected ? color.onBrand : color.inkSecondary}
            />
            <Text variant="captionStrong" tone={selected ? 'onBrand' : 'secondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── Recompra ─────────────────────────────────────────────────────────────── */

function LastOrderCard({ order, onRepeat }: { order: Order; onRepeat: () => void }) {
  const summary = order.lines.map(describeLine).filter(Boolean).join(' · ');

  return (
    <View style={styles.lastOrder}>
      <View style={styles.lastOrderHead}>
        <Chip label="Tu último pedido" />
        <Text variant="micro" tone="muted">
          {formatRelativeDay(order.placedAt)}
        </Text>
      </View>

      <Text variant="h3" numberOfLines={2}>
        {summary}
      </Text>
      <Text variant="caption" tone="secondary">
        {formatPrice(order.total)} · {order.deliveryMode === 'delivery' ? 'Delivery' : 'Retiro'}
      </Text>

      <Button
        label="Repetir pedido"
        onPress={onRepeat}
        accessibilityHint="Carga el pedido anterior en el carrito para que puedas revisarlo"
        style={styles.lastOrderButton}
      />
    </View>
  );
}

/* ── Filas de menú ────────────────────────────────────────────────────────── */

/**
 * Fila de pizza: foto circular, nombre y los tamaños abreviados, como en la referencia.
 *
 * Las iniciales no son decorativas: cada una abre el Constructor con ese tamaño ya
 * elegido. La referencia muestra "R | M | L" como etiqueta muerta; convertirlas en atajos
 * reales cuesta lo mismo y ahorra un paso al usuario que ya sabe qué quiere.
 */
function PizzaRow({
  pizza,
  onOpen,
  twoUp = false,
}: {
  pizza: Pizza;
  onOpen: (sizeId?: string) => void;
  twoUp?: boolean;
}) {
  return (
    <View style={[styles.row, twoUp && styles.rowTwoUp]}>
      <Pressable
        onPress={() => onOpen()}
        accessibilityRole="button"
        accessibilityLabel={`${pizza.name}. ${pizza.description}. Desde ${formatPrice(priceFrom(pizza.id))}`}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}>
        <Image source={pizza.image} style={styles.rowPhoto} contentFit="cover" transition={160} />

        <View style={styles.rowText}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {pizza.name}
          </Text>
          <Text variant="micro" tone="secondary" numberOfLines={1}>
            {pizza.description}
          </Text>
          <Text variant="captionStrong" tone="brand">
            Desde {formatPrice(priceFrom(pizza.id))}
          </Text>
        </View>
      </Pressable>

      <View style={styles.sizeRow}>
        {SIZES.map((size, index) => (
          <View key={size.id} style={styles.sizeItem}>
            {index > 0 ? <Text variant="caption" tone="muted">|</Text> : null}
            <Pressable
              onPress={() => onOpen(size.id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${pizza.name}, tamaño ${size.name}`}
              style={({ pressed }) => [styles.sizeButton, pressed && styles.pressed]}>
              <Text variant="captionStrong">{size.name.charAt(0)}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Fila de bebida, acompañamiento o postre. Se agrega directo: no se configura. */
function AddonRow({
  addon,
  onAdd,
  twoUp = false,
}: {
  addon: Addon;
  onAdd: () => void;
  twoUp?: boolean;
}) {
  return (
    <Pressable
      onPress={onAdd}
      accessibilityRole="button"
      accessibilityLabel={`Agregar ${addon.name} ${addon.detail}, ${formatPrice(addon.price)}`}
      style={({ pressed }) => [
        styles.row,
        styles.rowMain,
        twoUp && styles.rowTwoUp,
        pressed && styles.pressed,
      ]}>
      {/* El tinte del producto queda de fondo mientras la foto decodifica. */}
      <Image
        source={addon.image}
        style={[styles.rowPhoto, { backgroundColor: addon.color }]}
        contentFit="cover"
        transition={160}
      />

      <View style={styles.rowText}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {addon.name}
        </Text>
        <Text variant="micro" tone="secondary" numberOfLines={1}>
          {addon.detail}
        </Text>
        <Text variant="captionStrong" tone="brand">
          {formatPrice(addon.price)}
        </Text>
      </View>

      <View style={styles.addCircle} pointerEvents="none">
        <Icon name="add" size={20} color={color.onBrand} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: FLOATING_BAR_CLEARANCE,
    // Centrado vertical: cuando el contenido es más bajo que la pantalla, el espacio que
    // sobra se reparte arriba y abajo en lugar de quedar todo abajo.
    //
    // `flexGrow: 1` le da al contenedor al menos el alto de la ventana. Si el contenido
    // es más alto, el contenedor crece con él y no queda espacio libre que repartir, así
    // que `center` no desplaza nada y el scroll sigue empezando arriba. Por eso es seguro
    // dejarlo siempre puesto y no condicionarlo al tamaño.
    flexGrow: 1,
    justifyContent: 'center',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.lg,
  },

  // Sin `alignItems`, que por defecto es `stretch`: así la columna derecha toma el alto
  // de la izquierda y la portada puede llenarlo. Con `flex-start` la portada se quedaba
  // en su alto mínimo y dejaba un hueco gris debajo.
  columns: { flexDirection: 'row', gap: space.xl },
  columnLeft: { flex: 1 },
  columnRight: { flex: 1.15 },
  columnLeftXWide: { flex: 1.75 },
  columnRightXWide: { flex: 1 },
  column: { gap: space.lg },

  /* Portada */
  hero: {
    borderRadius: radius.card,
    overflow: 'hidden',
    minHeight: 320,
    justifyContent: 'flex-end',
    backgroundColor: color.ink,
    ...elevation.card,
  },
  // `flex: 1` llena el alto de la columna, que a su vez iguala a la del menú. El
  // `minHeight` queda como piso para cuando el menú es corto (una sola pestaña filtrada).
  heroWide: { flex: 1, minHeight: 620 },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Velo obligatorio: sin él, el texto depende de qué zona de la foto le toque detrás.
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.photoScrim,
  },
  heroContent: { padding: space.xl, gap: space.xxl, justifyContent: 'space-between', flex: 1 },
  // Amarillo sobre oscuro: el único lugar donde el amarillo hace de color de texto.
  heroTitle: { color: color.brand, textTransform: 'uppercase' },
  heroFoot: { gap: space.xs, marginTop: 'auto' },
  heroSub: { marginBottom: space.md },
  heroButton: { alignSelf: 'flex-start' },

  /* Buscador */
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.sm,
    paddingBottom: space.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: color.borderStrong,
  },
  searchInput: {
    flex: 1,
    minHeight: touchTarget - 8,
    fontSize: 15,
    color: color.ink,
    outlineStyle: 'none',
  } as object,

  /* Modo de entrega */
  modeSwitch: {
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
    alignSelf: 'flex-start',
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: touchTarget - 10,
    paddingHorizontal: space.lg,
    borderRadius: radius.full,
  },
  modeTabSelected: { backgroundColor: color.brand },

  /* Recompra */
  lastOrder: {
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.brandBorder,
    gap: space.xs,
    ...elevation.card,
  },
  lastOrderHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.xs,
  },
  lastOrderButton: { marginTop: space.md },

  /* Tarjeta de menú */
  menuCard: {
    padding: space.xl,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    gap: space.lg,
    ...elevation.card,
  },
  tabs: { flexDirection: 'row', gap: space.xxl },
  tab: { gap: space.sm, paddingTop: space.xs },
  tabUnderline: { height: 3, borderRadius: radius.full, backgroundColor: 'transparent' },
  tabUnderlineActive: { backgroundColor: color.brand },

  rows: { gap: space.md },
  // En monitores anchos las filas van de a dos: reduce a la mitad el alto del menú y usa
  // el ancho que de otro modo queda vacío a los costados.
  rowsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  // 48.8% y no 50%: el `gap` se descuenta del ancho disponible y con 50% la segunda
  // columna salta de línea por redondeo de subpíxeles.
  rowTwoUp: { width: '48.8%' },
  row: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: color.brandBorder,
    backgroundColor: color.surface,
    padding: space.md,
    gap: space.sm,
  },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  // Foto circular, como en la referencia.
  rowPhoto: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
  },
  rowText: { flex: 1, gap: 1 },

  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: space.xs,
  },
  sizeItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  sizeButton: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noResults: { paddingVertical: space.xxl, gap: space.xs },

  pressed: { opacity: 0.7 },
});
