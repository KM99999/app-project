/**
 * Pestañas — Forno
 *
 * En móvil la navegación es la **píldora flotante** de la referencia
 * ([`floating-tab-bar.tsx`](../../design-system/floating-tab-bar.tsx)). En escritorio se
 * oculta, porque ahí manda la barra lateral del layout raíz y duplicar los mismos destinos
 * en dos lugares solo genera dudas sobre cuál es el verdadero.
 *
 * Dos y solo dos destinos: Inicio y Carrito. Perfil y Pedidos son etapa 2; agregarlos
 * ahora vacíos le enseñaría al usuario que hay lugares donde no vale la pena entrar.
 */

import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/design-system/floating-tab-bar';
import { useIsWide } from '@/design-system/layout';
import { useOrder } from '@/store/order-store';

export default function TabsLayout() {
  const { itemCount } = useOrder();
  const isWide = useIsWide();

  return (
    <Tabs
      tabBar={(props) => (isWide ? null : <FloatingTabBar {...props} />)}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarBadge: itemCount > 0 ? (itemCount > 9 ? '9+' : itemCount) : undefined,
          tabBarAccessibilityLabel:
            itemCount > 0 ? `Carrito, ${itemCount} productos` : 'Carrito, vacío',
        }}
      />
    </Tabs>
  );
}
