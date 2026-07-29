/**
 * Navegación flotante — Forno
 *
 * La barra inferior de la referencia: no ocupa todo el ancho ni se pega al borde, sino que
 * flota como una píldora blanca sobre el contenido. El destino activo se expande a una
 * píldora naranja con etiqueta; los inactivos quedan como iconos circulares.
 *
 * Por qué se justifica el cambio respecto de una barra de pestañas convencional: acá el
 * contenido es fotografía a sangre, y una barra opaca de borde a borde corta la imagen con
 * una línea dura. Flotando, la foto respira por debajo y la navegación se lee como un
 * objeto encima de la app en lugar de un recorte.
 *
 * Lo que **no** cambia es la accesibilidad: cada destino conserva su área de 48px, su rol y
 * su estado seleccionado. El estilo flotante no puede costar eso.
 */

import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from './icon';
import { Text } from './text';
import { color, elevation, radius, space, touchTarget } from './tokens';

/** Icono por ruta. Vive acá y no en las opciones de cada pantalla para que la barra
 *  controle su propio lenguaje visual. */
const ICONS: Record<string, IconName> = {
  index: 'home',
  carrito: 'bag-handle',
};

/**
 * Forma mínima de lo que entrega `expo-router` al render de la barra.
 *
 * Se declara acá en vez de importar `BottomTabBarProps` de `@react-navigation/bottom-tabs`:
 * ese paquete es una dependencia transitiva y sus tipos no siempre resuelven desde este
 * proyecto. Solo se usan estos cuatro campos, así que atarse al tipo completo sería pagar
 * fragilidad por nada.
 */
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarBadge?: string | number;
        tabBarAccessibilityLabel?: string;
      };
    }
  >;
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.lg) }]}
      pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label =
            typeof options.title === 'string' ? options.title : route.name;
          const badge = options.tabBarBadge;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              style={({ pressed }) => [
                styles.item,
                focused && styles.itemActive,
                pressed && styles.pressed,
              ]}>
              <Icon
                name={ICONS[route.name] ?? 'ellipse'}
                size={20}
                color={focused ? color.onBrand : color.inkSecondary}
              />

              {/* La etiqueta aparece solo en el activo, como en la referencia: el resto
                  queda como icono y la barra no crece de ancho. */}
              {focused ? (
                <Text variant="captionStrong" tone="onBrand" numberOfLines={1}>
                  {label}
                </Text>
              ) : null}

              {!focused && badge ? (
                <View style={styles.badge}>
                  <Text variant="micro" tone="onBrand" style={styles.badgeText}>
                    {badge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Espacio que hay que reservar al final de un scroll para que la barra no tape contenido. */
export const FLOATING_BAR_CLEARANCE = 108;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    ...elevation.bar,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: touchTarget,
    minWidth: touchTarget,
    paddingHorizontal: space.lg,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  itemActive: { backgroundColor: color.brand },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.surface,
  },
  badgeText: { lineHeight: 14 },
});
