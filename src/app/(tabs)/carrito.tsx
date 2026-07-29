/**
 * Carrito — Forno
 *
 * Dos cosas que esta pantalla hace y que muchas apps del rubro no:
 *
 * — **El desglose va antes del botón, no después.** Subtotal, envío y total quedan a la
 *   vista mientras se decide continuar. Es la contrapartida del punto de fuga #1.
 * — **Cada línea es editable.** "Editar" vuelve al Constructor con la configuración
 *   cargada. Es lo que convierte "Repetir pedido" en un atajo real y no en un todo o nada:
 *   se repite el pedido de siempre y se le cambia la bebida sin salir del camino rápido.
 */

import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/design-system/icon';
import { Image } from 'expo-image';

import { Button } from '@/design-system/button';
import { Bounded, CONTENT_MAX_WIDTH_NARROW, narrowContent } from '@/design-system/layout';
import { Card, Chip, Divider, PriceRow, Stepper } from '@/design-system/primitives';
import { Screen, StickyBar, STICKY_BAR_CLEARANCE } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, radius, space } from '@/design-system/tokens';
import { formatPrice, pluralizeItems } from '@/domain/format';
import { getAddon, getPizza } from '@/domain/menu';
import { computeTotals, describeConfig, priceOfLine } from '@/domain/pricing';
import type { CartLine } from '@/domain/types';
import { useOrder } from '@/store/order-store';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lines, itemCount, deliveryMode, setQuantity } = useOrder();

  const totals = computeTotals(lines, deliveryMode);

  if (lines.length === 0) return <EmptyCart onBrowse={() => router.push('/')} />;

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Bounded maxWidth={CONTENT_MAX_WIDTH_NARROW}>
          <Text variant="display">Tu pedido</Text>
          <Text variant="caption" tone="secondary">
            {pluralizeItems(itemCount)}
          </Text>
        </Bounded>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, narrowContent]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.lines}>
          {lines.map((line) => (
            <CartLineCard
              key={line.id}
              line={line}
              onQuantityChange={(next) => setQuantity(line.id, next)}
              onEdit={
                line.kind === 'pizza'
                  ? () => router.push(`/constructor/${line.config.pizzaId}?lineId=${line.id}`)
                  : undefined
              }
            />
          ))}
        </View>

        <Button label="+ Agregar algo más" variant="ghost" onPress={() => router.push('/')} />

        {/* Empuja el ticket promedio sin recurrir a un pop-up: el usuario decide si le sirve. */}
        {!totals.freeDelivery && totals.amountToFreeDelivery > 0 ? (
          <View style={styles.freeDeliveryHint}>
            <Text variant="caption" tone="secondary">
              Te faltan{' '}
              <Text variant="captionStrong" tone="brand">
                {formatPrice(totals.amountToFreeDelivery)}
              </Text>{' '}
              para el envío gratis
            </Text>
          </View>
        ) : null}

        <Card style={styles.summary}>
          <PriceRow label="Subtotal" value={formatPrice(totals.subtotal)} />
          <PriceRow
            label="Envío"
            value={totals.deliveryFee === 0 ? 'Gratis' : formatPrice(totals.deliveryFee)}
            tone={totals.deliveryFee === 0 ? 'success' : undefined}
          />
          <Divider style={styles.summaryDivider} />
          <PriceRow label="Total" value={formatPrice(totals.total)} strong />
        </Card>
      </ScrollView>

      <StickyBar>
        <Button
          label="Continuar"
          trailing={formatPrice(totals.total)}
          onPress={() => router.push('/checkout')}
        />
      </StickyBar>
    </Screen>
  );
}

/* ── Línea del carrito ────────────────────────────────────────────────────── */

function CartLineCard({
  line,
  onQuantityChange,
  onEdit,
}: {
  line: CartLine;
  onQuantityChange: (next: number) => void;
  onEdit?: () => void;
}) {
  const isPizza = line.kind === 'pizza';
  const pizza = isPizza ? getPizza(line.config.pizzaId) : undefined;
  const addon = !isPizza ? getAddon(line.addonId) : undefined;

  const title = isPizza ? (pizza?.name ?? '') : (addon?.name ?? '');
  // Configuración en palabras, nunca un código interno: el usuario tiene que poder
  // verificar de un vistazo que pidió lo que quería.
  const detail = isPizza ? describeConfig(line.config) : (addon?.detail ?? '');

  return (
    <Card style={styles.lineCard}>
      <View style={styles.lineTop}>
        <Image
          source={isPizza ? pizza?.image : addon?.image}
          style={styles.thumb}
          contentFit="cover"
          transition={140}
        />

        <View style={styles.lineText}>
          <Text variant="bodyStrong">{title}</Text>
          {detail ? (
            <Text variant="caption" tone="secondary">
              {detail}
            </Text>
          ) : null}
          {onEdit ? (
            <Text
              variant="captionStrong"
              tone="brand"
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={`Editar ${title}`}
              style={styles.editLink}>
              Editar
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.lineBottom}>
        {/* min 0: bajar de 1 elimina la línea, que es lo que el usuario está pidiendo. */}
        <Stepper value={line.quantity} onChange={onQuantityChange} min={0} compact />
        <Text variant="h3">{formatPrice(priceOfLine(line))}</Text>
      </View>
    </Card>
  );
}

/* ── Estado vacío ─────────────────────────────────────────────────────────── */

/** Nunca una pantalla en blanco: se explica qué pasó y se ofrece la salida obvia. */
function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <Screen>
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Icon name="cart-outline" size={40} color={color.brand} />
        </View>
        <View style={styles.emptyText}>
          <Text variant="h1" center>
            Tu carrito está vacío
          </Text>
          <Text variant="body" tone="secondary" center>
            Elegí una pizza del menú y armala como más te guste.
          </Text>
        </View>
        <Chip label="Envío gratis desde $25.000" tone="success" style={styles.emptyChip} />
        <Button label="Ver el menú" onPress={onBrowse} fullWidth={false} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xl,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    gap: space.xs,
  },
  content: { padding: space.xl, paddingBottom: STICKY_BAR_CLEARANCE, gap: space.lg },

  lines: { gap: space.md },
  lineCard: { gap: space.md },
  lineTop: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  lineText: { flex: 1, gap: 2 },
  editLink: { marginTop: space.xs },
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: color.surfaceMuted },
  addonThumb: { alignItems: 'center', justifyContent: 'center' },
  lineBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  freeDeliveryHint: {
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
  },

  summary: { gap: 0 },
  summaryDivider: { marginVertical: space.sm },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
    gap: space.lg,
  },
  emptyText: { gap: space.sm },
  emptyChip: { alignSelf: 'center' },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
