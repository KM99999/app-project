/**
 * Seguimiento del pedido — Forno
 *
 * Responde la única pregunta que tiene el usuario después de pagar: "¿cuándo llega?".
 *
 * Dos decisiones deliberadas:
 *
 * — **Rango horario, no cuenta regresiva.** Un contador que se atrasa genera más ansiedad
 *   de la que resuelve. "Entre 20:35 y 20:45" se puede cumplir; "faltan 3 minutos" se
 *   incumple a la vista de todos.
 * — **El estado activo se distingue por tres canales** —color, peso tipográfico y forma
 *   del indicador— y nunca solo por color. Diferenciar únicamente por tinte deja la
 *   pantalla ilegible para buena parte de los usuarios con daltonismo.
 *
 * El avance de estados está simulado (ver SIMULATED_STEP_MS en el store). En producción
 * llega por websocket o push desde el sistema de la cocina.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/design-system/button';
import { narrowContent } from '@/design-system/layout';
import { PizzaArt } from '@/design-system/pizza-art';
import { Card, Divider, PriceRow } from '@/design-system/primitives';
import { Screen, ScreenHeader, StickyBar, STICKY_BAR_CLEARANCE } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, radius, space } from '@/design-system/tokens';
import { formatEtaWindow, formatPrice } from '@/domain/format';
import { ETA_MAX, ETA_MIN, getPizza } from '@/domain/menu';
import { describeLine } from '@/domain/pricing';
import type { Order } from '@/domain/types';
import { ORDER_STEPS, useOrder } from '@/store/order-store';

export default function TrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { getOrder } = useOrder();

  const order = getOrder(orderId);

  if (!order) {
    return (
      <Screen>
        <ScreenHeader title="Pedido no encontrado" onBack={() => router.replace('/')} />
        <View style={styles.notFound}>
          <Text tone="secondary" center>
            No pudimos encontrar ese pedido.
          </Text>
        </View>
      </Screen>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((step) => step.id === order.status);
  const delivered = order.status === 'entregado';

  // La ilustración toma la primera pizza del pedido: da identidad a la pantalla sin
  // necesidad de una animación pesada ni de una imagen descargada.
  const firstPizzaLine = order.lines.find((line) => line.kind === 'pizza');
  const heroPizza =
    firstPizzaLine && firstPizzaLine.kind === 'pizza'
      ? getPizza(firstPizzaLine.config.pizzaId)
      : undefined;

  return (
    <Screen>
      <ScreenHeader title={`Pedido #${order.number}`} />

      <ScrollView
        contentContainerStyle={[styles.content, narrowContent]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {heroPizza ? (
            <PizzaArt
              diameter={150}
              baseToppingIds={heroPizza.baseToppingIds}
              extras={firstPizzaLine?.kind === 'pizza' ? firstPizzaLine.config.extras : []}
              crustId={firstPizzaLine?.kind === 'pizza' ? firstPizzaLine.config.crustId : 'clasica'}
            />
          ) : null}

          <Text variant="h1" center style={styles.etaTitle}>
            {delivered
              ? '¡Tu pedido llegó!'
              : order.deliveryMode === 'delivery'
                ? `Llega ${formatEtaWindow(order.placedAt, ETA_MIN, ETA_MAX)}`
                : `Listo ${formatEtaWindow(order.placedAt, ETA_MIN - 15, ETA_MAX - 20)}`}
          </Text>
          <Text variant="caption" tone="secondary" center>
            {order.deliveryMode === 'delivery' ? order.address : 'Retiro en el local'}
          </Text>
        </View>

        <Card style={styles.timeline}>
          {ORDER_STEPS.map((step, index) => (
            <TimelineStep
              key={step.id}
              label={step.label}
              hint={step.hint}
              state={
                index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending'
              }
              isLast={index === ORDER_STEPS.length - 1}
            />
          ))}
        </Card>

        <OrderSummary order={order} />
      </ScrollView>

      <StickyBar>
        <Button label="Volver al inicio" variant="secondary" onPress={() => router.replace('/')} />
      </StickyBar>
    </Screen>
  );
}

/* ── Línea de tiempo ──────────────────────────────────────────────────────── */

type StepState = 'done' | 'active' | 'pending';

function TimelineStep({
  label,
  hint,
  state,
  isLast,
}: {
  label: string;
  hint: string;
  state: StepState;
  isLast: boolean;
}) {
  return (
    <View
      style={styles.step}
      accessibilityLabel={`${label}. ${
        state === 'done' ? 'Completado' : state === 'active' ? 'En curso' : 'Pendiente'
      }`}>
      <View style={styles.stepRail}>
        {/* Canal 3 de diferenciación: la forma del indicador. Relleno = hecho,
            anillo grueso = en curso, círculo vacío = pendiente. */}
        <View
          style={[
            styles.dot,
            state === 'done' && styles.dotDone,
            state === 'active' && styles.dotActive,
          ]}>
          {state === 'done' ? <View style={styles.dotCheck} /> : null}
        </View>
        {!isLast ? (
          <View style={[styles.rail, state === 'done' && styles.railDone]} />
        ) : null}
      </View>

      <View style={styles.stepText}>
        {/* Canales 1 y 2: color y peso tipográfico. */}
        <Text
          variant={state === 'active' ? 'bodyStrong' : 'body'}
          tone={state === 'active' ? 'warning' : state === 'done' ? 'default' : 'muted'}>
          {label}
        </Text>
        {state !== 'pending' ? (
          <Text variant="caption" tone="secondary">
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ── Resumen ──────────────────────────────────────────────────────────────── */

/** Queda visible para responder "¿qué pedí?" sin obligar a navegar a otra pantalla. */
function OrderSummary({ order }: { order: Order }) {
  const paymentLabel = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    tarjeta: 'Tarjeta',
  }[order.payment];

  return (
    <Card style={styles.summary}>
      <Text variant="h3">Tu pedido</Text>

      {order.lines.map((line) => (
        <View key={line.id} style={styles.summaryLine}>
          <Text variant="body" tone="secondary" style={styles.summaryLineText}>
            {line.quantity > 1 ? `${line.quantity}× ` : ''}
            {describeLine(line)}
          </Text>
        </View>
      ))}

      <Divider style={styles.divider} />
      <PriceRow label="Total" value={formatPrice(order.total)} strong />
      <Text variant="caption" tone="secondary">
        Pago: {paymentLabel}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: STICKY_BAR_CLEARANCE, gap: space.lg },

  hero: { alignItems: 'center', gap: space.xs, paddingVertical: space.lg },
  etaTitle: { marginTop: space.md },

  timeline: { gap: 0 },
  step: { flexDirection: 'row', gap: space.md },
  stepRail: { alignItems: 'center', width: 24 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Rellenos plenos acá, no los tonos de texto: el punto es una forma, no una palabra,
  // así que se rige por contraste no textual (3:1) y gana en viveza.
  dotDone: { borderColor: color.successFill, backgroundColor: color.successFill },
  dotActive: { borderColor: color.warningFill, borderWidth: 6, backgroundColor: color.warningSoft },
  dotCheck: {
    width: 5,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: color.onBrand,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },
  rail: { flex: 1, width: 2, backgroundColor: color.border, marginVertical: 2 },
  railDone: { backgroundColor: color.successFill },
  stepText: { flex: 1, paddingBottom: space.xl, gap: 2 },

  summary: { gap: space.sm },
  summaryLine: { flexDirection: 'row' },
  summaryLineText: { flex: 1 },
  divider: { marginVertical: space.xs },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl },
});
