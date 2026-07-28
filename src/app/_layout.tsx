/**
 * Layout raíz — Forno
 *
 * Providers, marco de escritorio y pila de navegación.
 *
 * La barra lateral vive **acá** y no dentro del grupo de pestañas, a propósito: si viviera
 * en las pestañas, desaparecería al abrir el Constructor o el Checkout —que son pantallas
 * de la pila— y el marco de la aplicación se desarmaría a mitad del flujo. Puesta en la
 * raíz, persiste en todo el recorrido, que es lo que se espera de un panel.
 *
 * Los encabezados nativos van apagados: cada pantalla usa `ScreenHeader` del sistema de
 * diseño, idéntico en iOS, Android y web. Con los encabezados nativos el prototipo se
 * vería distinto en cada plataforma y las revisiones se llenarían de ruido ajeno al diseño.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIsWide } from '@/design-system/layout';
import { Sidebar } from '@/design-system/sidebar';
import { color } from '@/design-system/tokens';
import { OrderProvider } from '@/store/order-store';
import { SectionNavProvider } from '@/store/section-nav';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OrderProvider>
        <SectionNavProvider>
          <StatusBar style="dark" />
          <AppShell />
        </SectionNavProvider>
      </OrderProvider>
    </SafeAreaProvider>
  );
}

/**
 * Se separa del layout raíz porque `useIsWide` necesita estar dentro de los providers, y
 * porque la barra lateral consume el carrito y la navegación por secciones.
 */
function AppShell() {
  const isWide = useIsWide();

  return (
    <View style={styles.shell}>
      {isWide ? <Sidebar /> : null}

      <View style={styles.main}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: color.surfaceSunken },
  main: { flex: 1 },
});
