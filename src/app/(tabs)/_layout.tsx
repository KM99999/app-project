/**
 * Pestañas — Forno
 *
 * Dos y solo dos: Inicio y Carrito.
 *
 * Perfil y Pedidos son etapa 2. Agregarlos ahora vacíos le enseñaría al usuario que hay
 * lugares de la app donde no vale la pena entrar, y esa lección después cuesta revertirla.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/design-system/primitives';
import { color, space, type } from '@/design-system/tokens';
import { useOrder } from '@/store/order-store';

export default function TabsLayout() {
  const { itemCount } = useOrder();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.brand,
        tabBarInactiveTintColor: color.inkMuted,
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopColor: color.border,
          // Icono más etiqueta necesitan ~50px de caja de contenido. Con el alto por
          // defecto no entran y la etiqueta queda cortada al ras del borde inferior en
          // web. El alto se calcula para dejar 52: 74 − 8 de arriba − 14 de abajo.
          // Medido en el navegador, no estimado.
          height: 74 + insets.bottom,
          paddingTop: space.sm,
          paddingBottom: insets.bottom + 14,
        },
        // `lineHeight` explícito: sin él, la altura de línea la decide la plataforma y
        // el cálculo de arriba deja de ser predecible.
        tabBarLabelStyle: {
          fontSize: type.micro.fontSize,
          lineHeight: type.micro.lineHeight,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color: tint, size }) => <Ionicons name="home" size={size} color={tint} />,
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          // El badge se dibuja sobre el icono para que el contador viaje con la pestaña.
          tabBarIcon: ({ color: tint, size }) => (
            <View>
              <Ionicons name="cart" size={size} color={tint} />
              <Badge count={itemCount} />
            </View>
          ),
          tabBarAccessibilityLabel:
            itemCount > 0 ? `Carrito, ${itemCount} productos` : 'Carrito, vacío',
        }}
      />
    </Tabs>
  );
}
