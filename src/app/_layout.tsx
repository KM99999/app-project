/**
 * Layout raíz — Forno
 *
 * Providers y pila de navegación. Los encabezados nativos van apagados: cada pantalla
 * usa `ScreenHeader` del sistema de diseño, que es idéntico en iOS, Android y web. Con
 * los encabezados nativos, el prototipo se vería distinto en cada plataforma y las
 * revisiones de diseño se llenarían de ruido que no es del diseño.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { color } from '@/design-system/tokens';
import { OrderProvider } from '@/store/order-store';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OrderProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: color.surfaceSunken },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="constructor/[pizzaId]" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkout" />
          {/* El seguimiento no debe poder cerrarse con gesto: el pedido ya se confirmó
              y volver atrás llevaría a un checkout sin carrito. */}
          <Stack.Screen name="seguimiento/[orderId]" options={{ gestureEnabled: false }} />
        </Stack>
      </OrderProvider>
    </SafeAreaProvider>
  );
}
