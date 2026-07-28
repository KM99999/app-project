/**
 * Inicio — Forno
 *
 * La pantalla tiene que servir a dos modos de uso sin obligar a ninguno a pasar por el
 * camino del otro (ver docs/01-investigacion.md §4):
 *
 * — Modo recompra: el bloque "Tu último pedido" está sobre el pliegue. Dos toques hasta
 *   la confirmación. Es el camino que recorre la mayor parte del volumen.
 * — Modo exploración: las más pedidas y el menú completo empiezan inmediatamente debajo,
 *   en el mismo scroll. No en otra pestaña.
 *
 * Si no hay historial, el bloque de recompra no se renderiza. No queda un placeholder
 * gris ocupando el mejor espacio de la app: es exactamente lo que critiqué de la App C
 * en el teardown.
 */

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/design-system/button';
import { PizzaArt } from '@/design-system/pizza-art';
import { Card, Chip } from '@/design-system/primitives';
import { Screen } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, radius, space, touchTarget } from '@/design-system/tokens';
import { formatPrice, formatRelativeDay } from '@/domain/format';
import { PIZZAS } from '@/domain/menu';
import { describeLine, priceFrom } from '@/domain/pricing';
import type { Order, Pizza } from '@/domain/types';
import { useOrder } from '@/store/order-store';

/** En producción viene del perfil. Acá alcanza para que el saludo no sea genérico. */
const USER_NAME = 'Carlos';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lastOrder, address, repeatLastOrder } = useOrder();

  const popular = PIZZAS.filter((pizza) => pizza.popular);

  const handleRepeat = () => {
    // Va al carrito y no directo al checkout: un toque más, a cambio de que el usuario
    // vea qué está comprando y pueda ajustarlo. Elimina el "todo o nada" de la App C.
    if (repeatLastOrder()) router.push('/carrito');
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text variant="display">Hola, {USER_NAME}</Text>
          <View style={styles.addressRow}>
            <Text variant="caption" tone="secondary">
              Enviar a:{' '}
            </Text>
            <Text variant="captionStrong" tone="secondary" numberOfLines={1} style={styles.address}>
              {address}
            </Text>
          </View>
        </View>

        {lastOrder ? <LastOrderCard order={lastOrder} onRepeat={handleRepeat} /> : null}

        <Section title="Las más pedidas">
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

        <Section title="Todo el menú">
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
      </ScrollView>
    </Screen>
  );
}

/* ── Bloque de recompra ───────────────────────────────────────────────────── */

function LastOrderCard({ order, onRepeat }: { order: Order; onRepeat: () => void }) {
  // Resumen en una línea: el usuario reconoce su pedido sin tener que leer un detalle.
  const summary = order.lines.map(describeLine).filter(Boolean).join(' · ');

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
      <Text variant="caption" tone="secondary">
        {formatPrice(order.total)} · {order.deliveryMode === 'delivery' ? 'Delivery' : 'Retiro'}
      </Text>

      <Button
        label="Repetir pedido"
        onPress={onRepeat}
        accessibilityHint="Carga el pedido anterior en el carrito para que puedas revisarlo"
        style={styles.repeatButton}
      />
    </Card>
  );
}

/* ── Catálogo ─────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h2" style={styles.sectionTitle}>
        {title}
      </Text>
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
        <PizzaArt diameter={96} baseToppingIds={pizza.baseToppingIds} />
      </View>
      <Text variant="captionStrong" numberOfLines={1}>
        {pizza.name}
      </Text>
      <Text variant="micro" tone="secondary">
        Desde {formatPrice(priceFrom(pizza.id))}
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
      <PizzaArt diameter={72} baseToppingIds={pizza.baseToppingIds} />

      <View style={styles.menuText}>
        <Text variant="bodyStrong">{pizza.name}</Text>
        {/* Dos líneas como techo: una descripción larga empuja el precio fuera de vista. */}
        <Text variant="caption" tone="secondary" numberOfLines={2}>
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
  content: { paddingBottom: space.huge, gap: space.xxl },

  greeting: { paddingHorizontal: space.lg, gap: space.xs },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  address: { flexShrink: 1 },

  lastOrderCard: { marginHorizontal: space.lg, gap: space.sm },
  lastOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repeatButton: { marginTop: space.sm },

  section: { gap: space.md },
  sectionTitle: { paddingHorizontal: space.lg },

  popularRow: { paddingHorizontal: space.lg, gap: space.md },
  popularCard: {
    width: 128,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 2,
  },
  popularArt: { alignItems: 'center', marginBottom: space.sm },

  menuList: { paddingHorizontal: space.lg, gap: space.md },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  menuText: { flex: 1, gap: 2 },
  addGlyph: {
    width: touchTarget - 12,
    height: touchTarget - 12,
    borderRadius: radius.full,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBarH: { width: 14, height: 2, borderRadius: 1, backgroundColor: color.brand },
  addBarV: { position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: color.brand },

  pressed: { opacity: 0.7 },
});
