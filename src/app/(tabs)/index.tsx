/**
 * Inicio — Forno
 *
 * La pantalla sirve a dos modos de uso sin obligar a ninguno a pasar por el camino del
 * otro (ver docs/01-investigacion.md §4):
 *
 * — Modo recompra: el bloque "Tu último pedido" está sobre el pliegue. Dos toques hasta
 *   la confirmación. Es el camino que recorre la mayor parte del volumen.
 * — Modo exploración: las más pedidas y el menú completo empiezan inmediatamente debajo,
 *   en el mismo scroll. No en otra pestaña.
 *
 * En escritorio el contenido tiene techo de ancho y el menú pasa a dos columnas. Sin eso,
 * una fila de menú cruza toda la pantalla y deja de poder leerse de un vistazo: la
 * ilustración queda a un extremo y el precio al otro.
 *
 * Las secciones se registran para que la barra lateral pueda desplazarse hasta ellas.
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/design-system/button';
import { Bounded, useIsWide } from '@/design-system/layout';
import { PizzaArt } from '@/design-system/pizza-art';
import { Card, Chip, Divider, StatTile } from '@/design-system/primitives';
import { Screen } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, elevation, radius, space } from '@/design-system/tokens';
import { formatPrice, formatRelativeDay, pluralizeItems } from '@/domain/format';
import { ETA_MAX, ETA_MIN, PIZZAS } from '@/domain/menu';
import { describeLine, priceFrom } from '@/domain/pricing';
import type { Order, Pizza } from '@/domain/types';
import { useOrder } from '@/store/order-store';
import { useSectionNav, type SectionId } from '@/store/section-nav';

/** En producción viene del perfil. Acá alcanza para que el saludo no sea genérico. */
const USER_NAME = 'Carlos';

/** Saludo según la hora. Un "Buenas noches" fijo a las 9 de la mañana se nota. */
function greeting(hour: number): string {
  if (hour < 6) return 'Buenas madrugadas';
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * El saludo se resuelve **después del montaje**, nunca durante el render inicial.
 *
 * El export es estático: el HTML se genera en el build, con la hora de la máquina que
 * compiló. Si el saludo se calculara en el render, el servidor escribiría "Buenas tardes"
 * y el cliente "Buenas noches", y React aborta la hidratación por diferencia de texto
 * (error #418). Se reserva el espacio con un carácter invisible para que la línea no
 * salte cuando aparece el texto real.
 */
function useGreeting(): string {
  const [value, setValue] = useState(' ');
  useEffect(() => setValue(greeting(new Date().getHours())), []);
  return value;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();
  const { lastOrder, address, repeatLastOrder } = useOrder();
  const { request } = useSectionNav();
  const salutation = useGreeting();

  const scrollRef = useRef<ScrollView>(null);
  // Posición vertical de cada sección dentro del contenido del scroll. Se llena con
  // onLayout, así que no hace falta medir nada a mano ni hardcodear alturas.
  const offsets = useRef<Record<SectionId, number>>({ populares: 0, menu: 0 });

  useEffect(() => {
    if (!request) return;
    scrollRef.current?.scrollTo({
      // Un respiro por encima del encabezado de la sección, para que no quede pegado
      // al borde superior.
      y: Math.max(offsets.current[request.section] - space.lg, 0),
      animated: true,
    });
  }, [request]);

  const captureOffset = (section: SectionId) => (event: LayoutChangeEvent) => {
    offsets.current[section] = event.nativeEvent.layout.y;
  };

  const popular = PIZZAS.filter((pizza) => pizza.popular);

  const handleRepeat = () => {
    // Va al carrito y no directo al checkout: un toque más, a cambio de que el usuario
    // vea qué está comprando y pueda ajustarlo antes de confirmar.
    if (repeatLastOrder()) router.push('/carrito');
  };

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: (isWide ? space.xxxl : insets.top) + space.xl }]}>
          <Bounded>
            <Text variant="micro" tone="secondary">
              {salutation}
            </Text>
            <Text variant="display">Hola, {USER_NAME}</Text>

            {/* La dirección como objeto con superficie propia, no como texto suelto: es el
                dato que el usuario verifica primero y el que más cambia. */}
            <View style={styles.addressPill}>
              <View style={styles.pin} />
              <Text variant="micro" tone="secondary" numberOfLines={1} style={styles.addressText}>
                {address}
              </Text>
            </View>
          </Bounded>
        </View>

        <View style={styles.body}>
          <Bounded style={styles.stack}>
            {lastOrder ? <LastOrderCard order={lastOrder} onRepeat={handleRepeat} /> : null}

            <View onLayout={captureOffset('populares')} style={styles.section}>
              <SectionHead title="Las más pedidas" hint="Lo que más sale del horno" />

              {isWide ? (
                // En escritorio hay ancho de sobra: se despliegan todas y se evita un
                // scroll horizontal que en desktop nadie descubre.
                <View style={styles.popularGrid}>
                  {popular.map((pizza) => (
                    <PopularCard
                      key={pizza.id}
                      pizza={pizza}
                      wide
                      onPress={() => router.push(`/constructor/${pizza.id}`)}
                    />
                  ))}
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.popularRow}>
                  {popular.map((pizza) => (
                    <PopularCard
                      key={pizza.id}
                      pizza={pizza}
                      onPress={() => router.push(`/constructor/${pizza.id}`)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            <View onLayout={captureOffset('menu')} style={styles.section}>
              <SectionHead title="Todo el menú" hint={`${PIZZAS.length} pizzas disponibles`} />
              <View style={[styles.menuList, isWide && styles.menuGrid]}>
                {PIZZAS.map((pizza) => (
                  <MenuRow
                    key={pizza.id}
                    pizza={pizza}
                    wide={isWide}
                    onPress={() => router.push(`/constructor/${pizza.id}`)}
                  />
                ))}
              </View>
            </View>
          </Bounded>
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ── Bloque de recompra ───────────────────────────────────────────────────── */

function LastOrderCard({ order, onRepeat }: { order: Order; onRepeat: () => void }) {
  // Resumen en una línea: el usuario reconoce su pedido sin tener que leer un detalle.
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

      <Text variant="h3" numberOfLines={2} style={styles.lastOrderTitle}>
        {summary}
      </Text>

      {/* Fila de métricas: el dato manda, la etiqueta acompaña. Le da al bloque la
          densidad de un tablero y responde de un vistazo "¿qué estoy por repetir?". */}
      <View style={styles.statsRow}>
        <StatTile value={String(itemCount)} label={pluralizeItems(itemCount).split(' ')[1]} />
        <View style={styles.statDivider} />
        <StatTile value={formatPrice(order.total)} label="Total" tone="brand" />
        <View style={styles.statDivider} />
        <StatTile value={`${ETA_MIN}-${ETA_MAX}'`} label="Minutos" />
      </View>

      <Divider style={styles.lastOrderDivider} />

      <Button
        label="Repetir pedido"
        onPress={onRepeat}
        accessibilityHint="Carga el pedido anterior en el carrito para que puedas revisarlo"
      />
    </Card>
  );
}

/* ── Catálogo ─────────────────────────────────────────────────────────────── */

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text variant="h2">{title}</Text>
      {hint ? (
        <Text variant="micro" tone="secondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function PopularCard({
  pizza,
  onPress,
  wide = false,
}: {
  pizza: Pizza;
  onPress: () => void;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pizza.name}, desde ${formatPrice(priceFrom(pizza.id))}`}
      style={({ pressed }) => [
        styles.popularCard,
        wide && styles.popularCardWide,
        pressed && styles.pressed,
      ]}>
      <View style={styles.popularArt}>
        <PizzaArt diameter={wide ? 116 : 92} baseToppingIds={pizza.baseToppingIds} />
      </View>
      <Text variant="captionStrong" numberOfLines={1}>
        {pizza.name}
      </Text>
      <Text variant="micro" tone="secondary">
        Desde{' '}
        <Text variant="micro" tone="brand">
          {formatPrice(priceFrom(pizza.id))}
        </Text>
      </Text>
    </Pressable>
  );
}

function MenuRow({
  pizza,
  onPress,
  wide = false,
}: {
  pizza: Pizza;
  onPress: () => void;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pizza.name}. ${pizza.description}. Desde ${formatPrice(priceFrom(pizza.id))}`}
      style={({ pressed }) => [
        styles.menuRow,
        wide && styles.menuRowWide,
        pressed && styles.pressed,
      ]}>
      <View style={styles.menuArt}>
        <PizzaArt diameter={60} baseToppingIds={pizza.baseToppingIds} />
      </View>

      <View style={styles.menuText}>
        <Text variant="bodyStrong">{pizza.name}</Text>
        {/* Dos líneas como techo: una descripción larga empuja el precio fuera de vista. */}
        <Text variant="micro" tone="secondary" numberOfLines={2}>
          {pizza.description}
        </Text>
        <Text variant="captionStrong" tone="brand">
          Desde {formatPrice(priceFrom(pizza.id))}
        </Text>
      </View>

      {/* Afordancia visual de "agregar". El área táctil es la fila entera. */}
      <View style={styles.addGlyph} pointerEvents="none">
        <View style={styles.addBarH} />
        <View style={styles.addBarV} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.huge },

  header: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    alignSelf: 'flex-start',
    marginTop: space.sm,
    paddingVertical: space.xs2,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
    maxWidth: '100%',
  },
  pin: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: color.brand },
  addressText: { flexShrink: 1 },

  body: { padding: space.xl },
  stack: { gap: space.xxl },
  section: { gap: space.md },
  sectionHead: { gap: 1 },

  popularRow: { gap: space.md, paddingRight: space.xs },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  popularCard: {
    width: 124,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 1,
    ...elevation.card,
  },
  popularCardWide: { width: 176, padding: space.lg },
  popularArt: { alignItems: 'center', marginBottom: space.sm },

  menuList: { gap: space.md },
  // Dos columnas en escritorio. `48%` y no `50%` para que el `gap` no fuerce un salto de
  // línea por redondeo de subpíxeles.
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    ...elevation.card,
  },
  menuRowWide: { width: '48%' },
  // La ilustración sobre su propio cuadro gris: separa el producto de la ficha y le da
  // el ritmo de fila de tabla que tiene el panel.
  menuArt: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, gap: 1 },
  addGlyph: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBarH: { width: 12, height: 1.5, borderRadius: 1, backgroundColor: color.onBrand },
  addBarV: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    borderRadius: 1,
    backgroundColor: color.onBrand,
  },

  lastOrderCard: { gap: space.md, ...elevation.raised },
  lastOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastOrderTitle: { marginTop: -space.xs },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: color.surfaceSunken,
    borderWidth: 1,
    borderColor: color.border,
  },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: color.border },
  lastOrderDivider: { marginTop: space.xs },

  pressed: { opacity: 0.65 },
});
