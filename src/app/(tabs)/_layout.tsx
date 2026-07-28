/**
 * Pestañas — Forno
 *
 * La navegación móvil: barra inferior, que es la convención nativa de iOS y Android y la
 * que cae en la zona del pulgar.
 *
 * En escritorio se oculta, porque ahí la navegación la lleva la barra lateral (montada en
 * el layout raíz). Duplicar los mismos destinos en dos lugares a la vez solo genera dudas
 * sobre cuál es el "verdadero".
 *
 * Dos y solo dos destinos: Inicio y Carrito. Perfil y Pedidos son etapa 2; agregarlos
 * ahora vacíos le enseñaría al usuario que hay lugares donde no vale la pena entrar.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsWide } from '@/design-system/layout';
import { Badge } from '@/design-system/primitives';
import { color, space, type } from '@/design-system/tokens';
import { useOrder } from '@/store/order-store';

export default function TabsLayout() {
  const { itemCount } = useOrder();
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.brand,
        tabBarInactiveTintColor: color.inkMuted,
        tabBarStyle: isWide
          ? styles.tabBarHidden
          : {
              backgroundColor: color.surface,
              borderTopColor: color.border,
              // Icono (24) más etiqueta (lineHeight 20) necesitan ~54px de caja. Con el
              // alto por defecto la etiqueta queda cortada al ras del borde inferior en
              // web. Deja 58: 80 − 8 de arriba − 14 de abajo.
              // Medido en el navegador, no estimado.
              height: 80 + insets.bottom,
              paddingTop: space.sm,
              paddingBottom: insets.bottom + 14,
            },
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

const styles = StyleSheet.create({
  tabBarHidden: { display: 'none' },
});
