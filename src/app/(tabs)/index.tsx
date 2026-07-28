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
 * Si no hay historial, el bloque de recompra no se renderiza: no queda un placeholder
 * gris ocupando el mejor espacio de la app.
 *
 * Visualmente sigue el lenguaje del panel: encabezado sobre superficie blanca, tarjetas
 * con radio de 10 y sombra tenue, y el resumen del último pedido resuelto con la misma
 * fila de métricas que usaría un tablero de ventas.
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/design-system/button';
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
  const [value, setValue] = useState(' ');
  useEffect(() => setValue(greeting(new Date().getHours())), []);
  return value;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lastOrder, address, repeatLastOrder } = useOrder();
  const salutation = useGreeting();

  const popular = PIZZAS.filter((pizza) => pizza.popular);

  const handleRepeat = () => {
    // Va al carrito y no directo al checkout: un toque más, a cambio de que el usuario
    // vea qué está comprando y pueda ajustarlo antes de confirmar.
    if (repeatLastOrder()) router.push('/carrito');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + space.xl }]}>
          <Text variant="micro" tone="secondary">
            {salutation}
          </Text>
          <Text variant="display">Hola, {USER_NAME}</Text>

          {/* La dirección como objeto con superficie propia, no como texto suelto: es el
              dato que el usuario verifica primero y el que más cambia (casa vs. oficina). */}
          <View style={styles.addressPill}>
            <View style={styles.pin} />
            <Text variant="micro" tone="secondary" numberOfLines={1} style={styles.addressText}>
              {address}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {lastOrder ? <LastOrderCard order={lastOrder} onRepeat={handleRepeat} /> : null}

          <Section title="Las más pedidas" hint="Lo que más sale del horno">
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
          </Section>

          <Section title="Todo el menú" hint={`${PIZZAS.length} pizzas disponibles`}>
            <View style={styles.menuList}>
              {PIZZAS.map((pizza) => (
                <MenuRow
                  key={pizza.id}
                  pizza={pizza}
                  onPress={() => router.push(`/constructor/${pizza.id}`)}
                />
              ))}
            </View>
          </Section>
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

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text variant="h2">{title}</Text>
        {hint ? (
          <Text variant="micro" tone="secondary">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function PopularCard({ pizza, onPress }: { pizza: Pizza; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pizza.name}, desde ${formatPrice(priceFrom(pizza.id))}`}
      style={({ pressed }) => [styles.popularCard, pressed && styles.pressed]}>
      <View style={styles.popularArt}>
        <PizzaArt diameter={92} baseToppingIds={pizza.baseToppingIds} />
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

function MenuRow({ pizza, onPress }: { pizza: Pizza; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pizza.name}. ${pizza.description}. Desde ${formatPrice(priceFrom(pizza.id))}`}
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
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
    gap: space.xs,
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
  pin: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: color.brand,
  },
  addressText: { flexShrink: 1 },

  body: { padding: space.xl, gap: space.xxl },

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

  section: { gap: space.md },
  sectionHead: { gap: 1 },

  popularRow: { gap: space.md, paddingRight: space.xs },
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
  popularArt: { alignItems: 'center', marginBottom: space.sm },

  menuList: { gap: space.md },
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

  pressed: { opacity: 0.65 },
});
