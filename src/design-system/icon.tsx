/**
 * Icono — Forno
 *
 * Envoltorio de Ionicons que **no se dibuja en el primer render**.
 *
 * Por qué: `@expo/vector-icons` dibuja glifos de una fuente que en el build no está
 * cargada. El HTML estático sale con un elemento y el navegador, ya con la fuente,
 * produce otro distinto: React aborta la hidratación con el error #418. Se detectó
 * midiendo, no adivinando — las únicas dos rutas que fallaban eran exactamente las dos
 * que dibujaban iconos en el contenido de la página.
 *
 * En lugar de renunciar a los iconos, hasta el montaje se dibuja un hueco del **mismo
 * tamaño**. El espacio queda reservado, así que no hay salto de layout: el icono aparece
 * un frame después y no se percibe.
 *
 * Esta es la tercera vez que el export estático muerde por lo mismo (el saludo según la
 * hora, el ancho de ventana y ahora la fuente de iconos). La regla general está en
 * docs/04-sistema-de-diseno.md §8: nada que no exista en el build puede decidirse durante
 * el primer render.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { useMounted } from './layout';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color: string;
}) {
  const mounted = useMounted();

  // El hueco reserva exactamente el mismo espacio que ocupará el glifo.
  if (!mounted) return <View style={{ width: size, height: size }} />;

  return <Ionicons name={name} size={size} color={color} />;
}
