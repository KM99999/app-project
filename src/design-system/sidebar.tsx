/**
 * Barra lateral — Forno
 *
 * El riel amarillo de la referencia: angosto, a plena saturación, con el icono sobre la
 * etiqueta y todo centrado. Es el elemento que le da identidad a la pantalla completa.
 *
 * Solo se monta en pantallas anchas. En móvil manda la píldora flotante inferior, que es
 * la convención nativa y la que cae en la zona del pulgar.
 *
 * **Sobre el amarillo se escribe con tinta oscura** (`onBrand`), nunca con blanco: el
 * blanco sobre este amarillo da 1.4:1 y desaparece. Ver la nota de `color` en tokens.
 *
 * Los ítems son de dos clases y se comportan distinto a propósito:
 * — **Rutas** (Inicio, Carrito) navegan.
 * — **Secciones** (Menú, Más pedidas) desplazan dentro de Inicio, porque son partes de una
 *   misma página y no destinos separados.
 *
 * La referencia trae además Store, Contact y Login. No están acá porque no están
 * construidos, y un ítem de navegación que no lleva a ningún lado enseña a desconfiar del
 * resto del riel.
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
        <Icon name="pizza" size={30} color={color.onBrand} />
        <Text variant="micro" tone="onBrand" style={styles.brandLabel}>
          FORNO
        </Text>
      </View>

      <View style={styles.items}>
        <RailItem
          icon="home"
          label="Inicio"
          selected={onHome && active === null}
          onPress={goHome}
        />
        <RailItem
          icon="restaurant"
          label="Menú"
          selected={onHome && active === 'menu'}
          onPress={() => goSection('menu')}
        />
        <RailItem
          icon="flame"
          label="Más pedidas"
          selected={onHome && active === 'populares'}
          onPress={() => goSection('populares')}
        />
        <RailItem
          icon="bag-handle"
          label="Carrito"
          selected={onCart}
          badge={itemCount}
          onPress={goToCart}
        />
      </View>

      {/* Nota de alcance visible, para que nadie confunda el prototipo con el producto. */}
      <View style={styles.footer}>
        <Text variant="micro" tone="onBrand" center style={styles.footerText}>
          Prototipo · Etapa 1
        </Text>
      </View>
    </View>
  );
}

function RailItem({
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
      <View>
        <Icon name={icon} size={22} color={color.onBrand} />
        {badge > 0 ? (
          <View style={styles.badge}>
            <Text variant="micro" tone="onBrand" style={styles.badgeText}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        variant={selected ? 'captionStrong' : 'caption'}
        tone="onBrand"
        center
        numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIDEBAR_WIDTH,
    backgroundColor: color.rail,
    paddingVertical: space.xxl,
    paddingHorizontal: space.sm,
    alignItems: 'center',
    gap: space.xxxl,
  },

  brand: { alignItems: 'center', gap: space.xs },
  brandLabel: { letterSpacing: 1.4, fontWeight: '800' },

  items: { alignSelf: 'stretch', gap: space.sm },
  item: {
    minHeight: touchTarget + 20,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs2,
  },
  // El estado activo se marca oscureciendo el amarillo, no aclarándolo: sobre un riel a
  // plena saturación un tinte más claro casi no se distingue.
  itemSelected: { backgroundColor: 'rgba(22, 19, 18, 0.12)' },
  itemPressed: { backgroundColor: 'rgba(22, 19, 18, 0.06)' },

  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sobre la píldora oscura el texto va claro; es la única inversión del riel.
  badgeText: { lineHeight: 14, color: color.surface },

  footer: { marginTop: 'auto', paddingHorizontal: space.xs },
  footerText: { opacity: 0.65 },
});
