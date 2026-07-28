/**
 * Checkout — Forno
 *
 * Último punto donde se puede eliminar la sorpresa de precio, así que acá el monto
 * aparece dos veces a propósito: en el resumen y **dentro del botón de confirmación**.
 * No es redundancia decorativa; es el número que el usuario está por autorizar.
 *
 * Tres secciones numeradas, mismo patrón que el Constructor. Un formulario que se lee
 * igual que la pantalla anterior es un formulario que no hay que aprender.
 */

import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/design-system/button';
import {
  Card,
  Divider,
  Field,
  OptionRow,
  PriceRow,
  SectionHeader,
  Segmented,
} from '@/design-system/primitives';
import { Screen, ScreenHeader, StickyBar, STICKY_BAR_CLEARANCE } from '@/design-system/screen';
import { Text } from '@/design-system/text';
import { color, radius, space } from '@/design-system/tokens';
import { formatPrice } from '@/domain/format';
import { ETA_MAX, ETA_MIN } from '@/domain/menu';
import { computeTotals } from '@/domain/pricing';
import type { DeliveryMode, PaymentMethod } from '@/domain/types';
import { useOrder } from '@/store/order-store';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'efectivo', label: 'Efectivo', description: 'Pagás al recibir el pedido' },
  { id: 'transferencia', label: 'Transferencia', description: 'Te enviamos el alias al confirmar' },
  { id: 'tarjeta', label: 'Tarjeta', description: 'Débito o crédito al recibir' },
];

const DELIVERY_OPTIONS: { value: DeliveryMode; label: string }[] = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'retiro', label: 'Retiro en el local' },
];

/** Sucursal de muestra. En producción se elige entre las cercanas. */
const PICKUP_BRANCH = 'Forno Almagro · Av. Corrientes 3400';

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    lines,
    deliveryMode,
    setDeliveryMode,
    payment,
    setPayment,
    address,
    setAddress,
    notes,
    setNotes,
    placeOrder,
  } = useOrder();

  const totals = computeTotals(lines, deliveryMode);

  // Sin dirección no se puede despachar. Es la única validación bloqueante de la v1:
  // el resto de los campos tienen valores por defecto o son opcionales.
  const missingAddress = deliveryMode === 'delivery' && address.trim().length === 0;
  const canConfirm = lines.length > 0 && !missingAddress;

  const handleConfirm = () => {
    const orderId = placeOrder();
    // `replace` y no `push`: el pedido ya está confirmado, y volver atrás llevaría a un
    // checkout con el carrito vacío.
    router.replace(`/seguimiento/${orderId}`);
  };

  return (
    <Screen>
      <ScreenHeader title="Confirmar pedido" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <SectionHeader step={1} title="Entrega" />
            <Segmented options={DELIVERY_OPTIONS} value={deliveryMode} onChange={setDeliveryMode} />

            {deliveryMode === 'delivery' ? (
              <View style={styles.fields}>
                <Field
                  label="Dirección"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Calle, número y piso"
                />
                {missingAddress ? (
                  <Text variant="caption" tone="brand">
                    Necesitamos una dirección para poder enviarte el pedido.
                  </Text>
                ) : null}
                <Field
                  label="Referencias"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Timbre roto, portón negro, llamar al llegar…"
                  optional
                  multiline
                />
              </View>
            ) : (
              <Card style={styles.branchCard}>
                <Text variant="bodyStrong">{PICKUP_BRANCH}</Text>
                <Text variant="caption" tone="secondary">
                  Retirás en mostrador. Sin costo de envío.
                </Text>
              </Card>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader step={2} title="Pago" />
            <View style={styles.optionList}>
              {PAYMENT_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  description={option.description}
                  selected={option.id === payment}
                  onPress={() => setPayment(option.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader step={3} title="Resumen" />
            <Card>
              <PriceRow label="Subtotal" value={formatPrice(totals.subtotal)} />
              <PriceRow
                label={deliveryMode === 'delivery' ? 'Envío' : 'Retiro en el local'}
                value={totals.deliveryFee === 0 ? 'Gratis' : formatPrice(totals.deliveryFee)}
                tone={totals.deliveryFee === 0 ? 'success' : undefined}
              />
              <Divider style={styles.divider} />
              <PriceRow label="Total" value={formatPrice(totals.total)} strong />

              <View style={styles.eta}>
                <Text variant="caption" tone="secondary">
                  {deliveryMode === 'delivery'
                    ? `Llega en ${ETA_MIN}–${ETA_MAX} min`
                    : `Listo para retirar en ${ETA_MIN - 15}–${ETA_MAX - 20} min`}
                </Text>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StickyBar>
        <Button
          label="Confirmar"
          trailing={formatPrice(totals.total)}
          onPress={handleConfirm}
          disabled={!canConfirm}
        />
      </StickyBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.lg, paddingBottom: STICKY_BAR_CLEARANCE, gap: space.xxl },
  section: { gap: space.md },
  optionList: { gap: space.sm },
  fields: { gap: space.md },
  branchCard: { gap: space.xs },
  divider: { marginVertical: space.sm },
  eta: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.sm,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
  },
});
