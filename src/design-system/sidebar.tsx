/**
 * Barra lateral — Forno
 *
 * La navegación de escritorio, en el formato del panel de administración: superficie
 * blanca, borde a la derecha, marca arriba, ítems agrupados bajo epígrafes en mayúsculas
 * y el ítem activo en índigo suave.
 *
 * Solo se monta en pantallas anchas. En móvil manda la barra de pestañas inferior, que es
 * la convención nativa y la que cae en la zona del pulgar.
 *
 * Los ítems son de dos clases y se comportan distinto a propósito:
 * — **Rutas** (Inicio, Carrito) navegan.
 * — **Secciones** (Las más pedidas, Todo el menú) desplazan dentro de Inicio, porque son
 *   partes de una misma página y no destinos separados. Convertirlas en rutas obligaría a
 *   una recarga para volver a ver el catálogo completo.
 */

import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useOrder } from '@/store/order-store';
import { useSectionNav, type SectionId } from '@/store/section-nav';
import { Icon, type IconName } from './icon';
import { SIDEBAR_WIDTH } from './layout';
import { Text } from './text';
import { color, radius, space, touchTarget } from './tokens';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useOrder();
  const { goToSection, active, setActive } = useSectionNav();

  const onHome = pathname === '/' || pathname === '/(tabs)';
  const onCart = pathname.includes('carrito');

  const goHome = () => {
    setActive(null);
    router.push('/');
  };

  const goToCart = () => {
    setActive(null);
    router.push('/carrito');
  };

  const goSection = (section: SectionId) => {
    // Si el usuario está en otra pantalla, primero hay que traerlo a Inicio; el pedido de
    // desplazamiento queda en el contexto y la pantalla lo atiende al montarse.
    if (!onHome) router.push('/');
    goToSection(section);
  };

  return (
    <View style={styles.root}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text variant="bodyStrong" tone="onBrand">
            F
          </Text>
        </View>
        <View>
          <Text variant="h3">Forno</Text>
          <Text variant="micro" tone="secondary">
            Pizzas a domicilio
          </Text>
        </View>
      </View>

      <View style={styles.group}>
        <Text variant="micro" tone="muted" style={styles.groupLabel}>
          PRINCIPAL
        </Text>

        <SidebarItem
          icon="home-outline"
          label="Inicio"
          selected={onHome && active === null}
          onPress={goHome}
        />
        <SidebarItem
          icon="cart-outline"
          label="Carrito"
          selected={onCart}
          badge={itemCount}
          onPress={goToCart}
        />
      </View>

      <View style={styles.group}>
        <Text variant="micro" tone="muted" style={styles.groupLabel}>
          CATÁLOGO
        </Text>

        <SidebarItem
          icon="flame-outline"
          label="Las más pedidas"
          selected={onHome && active === 'populares'}
          onPress={() => goSection('populares')}
        />
        <SidebarItem
          icon="restaurant-outline"
          label="Todo el menú"
          selected={onHome && active === 'menu'}
          onPress={() => goSection('menu')}
        />
      </View>

      {/* Nota de alcance visible, para que nadie confunda el prototipo con el producto. */}
      <View style={styles.footer}>
        <Text variant="micro" tone="muted">
          Prototipo de diseño · Etapa 1
        </Text>
      </View>
    </View>
  );
}

function SidebarItem({
  icon,
  label,
  selected,
  badge = 0,
  onPress,
}: {
  icon: IconName;
  label: string;
  selected: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected }}
      accessibilityLabel={badge > 0 ? `${label}, ${badge} productos` : label}
      style={({ pressed }) => [
        styles.item,
        selected && styles.itemSelected,
        pressed && !selected && styles.itemPressed,
      ]}>
      <Icon
        name={icon}
        size={20}
        color={selected ? color.brand : color.inkSecondary}
      />
      <Text
        variant={selected ? 'bodyStrong' : 'body'}
        tone={selected ? 'brand' : 'secondary'}
        numberOfLines={1}
        style={styles.itemLabel}>
        {label}
      </Text>

      {badge > 0 ? (
        <View style={styles.itemBadge}>
          <Text variant="micro" tone="onBrand" style={styles.itemBadgeText}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIDEBAR_WIDTH,
    backgroundColor: color.surface,
    borderRightWidth: 1,
    borderRightColor: color.border,
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.lg,
    gap: space.xxl,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.sm,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  group: { gap: space.xs },
  groupLabel: { paddingHorizontal: space.md, marginBottom: space.xs, letterSpacing: 0.6 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: touchTarget,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  itemSelected: { backgroundColor: color.brandSoft },
  itemPressed: { backgroundColor: color.surfaceMuted },
  itemLabel: { flex: 1 },
  itemBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.full,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBadgeText: { lineHeight: 16 },

  footer: { marginTop: 'auto', paddingHorizontal: space.md },
});
