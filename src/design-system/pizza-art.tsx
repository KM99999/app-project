/**
 * Ilustración procedural de pizza — Forno
 *
 * Dibuja la pizza con Views nativas a partir de la configuración actual: cada ingrediente
 * que el usuario agrega aparece sobre la masa en el momento. Es la "vista previa" del
 * paso 4 del flujo del Constructor, y hace que personalizar se sienta una respuesta y no
 * un formulario.
 *
 * Por qué generada y no fotos:
 * — refleja la configuración real, cosa que una foto de catálogo no puede hacer;
 * — no hay descarga de imágenes, así que no hay estados de carga ni saltos de layout;
 * — el prototipo queda autocontenido: funciona sin red, en iOS, Android y web.
 *
 * En producción conviene combinarla con fotografía real en el catálogo, y conservar la
 * ilustración dentro del Constructor, que es donde aporta.
 *
 * Ya soporta mitades: un ingrediente con `half: 'left'` dibuja sus marcas solo del lado
 * izquierdo. La v1 nunca lo ejerce; la v2 no necesita tocar este archivo.
 */

import { StyleSheet, View } from 'react-native';

import { getTopping } from '@/domain/menu';
import type { CrustId, PizzaHalf, ToppingSelection } from '@/domain/types';
import { pizzaColor, radius } from './tokens';

/** Marcas por ingrediente. Suficientes para leerse, pocas para no ensuciar el dibujo. */
const MARKS_PER_TOPPING = 7;

/** Ángulo áureo en radianes: reparte las marcas sin que se amontonen ni se alineen. */
const GOLDEN_ANGLE = 2.399963;

type Mark = {
  key: string;
  toppingId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

/**
 * Posiciones deterministas: la marca `k` siempre cae en el mismo lugar.
 *
 * Deliberadamente sin `Math.random()`. Con aleatoriedad, cada re-render reacomodaría los
 * ingredientes y la pizza titilaría con cada toque del usuario.
 */
function layoutMarks(selections: ToppingSelection[], fieldRadius: number): Mark[] {
  const marks: Mark[] = [];
  const total = Math.max(selections.length * MARKS_PER_TOPPING, 1);
  let k = 0;

  for (const selection of selections) {
    for (let i = 0; i < MARKS_PER_TOPPING; i++) {
      const angle = k * GOLDEN_ANGLE;
      // sqrt reparte parejo por área; si no, las marcas se apiñan en el centro.
      const distance = Math.sqrt((k + 0.5) / total) * fieldRadius;

      let x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      // Mitades: se refleja la marca al lado que corresponde en vez de recalcular.
      if (selection.half === 'left') x = -Math.abs(x);
      if (selection.half === 'right') x = Math.abs(x);

      marks.push({
        key: `${selection.toppingId}-${selection.half}-${i}`,
        toppingId: selection.toppingId,
        x,
        y,
        rotation: (k * 47) % 180,
        // Variación sutil de tamaño: sin ella el dibujo se ve mecánico.
        scale: 0.85 + ((k * 13) % 5) / 14,
      });
      k++;
    }
  }

  return marks;
}

export type PizzaArtProps = {
  /** Diámetro total en px, incluido el borde de masa. */
  diameter: number;
  /** Ingredientes que la pizza ya trae de fábrica. */
  baseToppingIds: string[];
  /** Ingredientes extra elegidos por el usuario. */
  extras?: ToppingSelection[];
  crustId?: CrustId;
  /** Escala relativa del tamaño elegido: una grande se dibuja más grande. */
  sizeScale?: number;
};

export function PizzaArt({
  diameter,
  baseToppingIds,
  extras = [],
  crustId = 'clasica',
  sizeScale = 1,
}: PizzaArtProps) {
  const outer = diameter * sizeScale;
  // La masa rellena lleva un borde más ancho: se lee la diferencia sin explicarla.
  const crustWidth = outer * (crustId === 'rellena' ? 0.1 : 0.065);
  const inner = outer - crustWidth * 2;

  const base: ToppingSelection[] = baseToppingIds.map((toppingId) => ({
    toppingId,
    half: 'whole' as PizzaHalf,
  }));
  // El campo útil deja un margen: los ingredientes no llegan hasta el borde de la masa.
  const marks = layoutMarks([...base, ...extras], (inner / 2) * 0.78);

  return (
    <View
      style={[styles.root, { width: outer, height: outer, borderRadius: outer / 2 }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Vista previa de la pizza">
      {/* Masa */}
      <View
        style={[
          styles.crust,
          { width: outer, height: outer, borderRadius: outer / 2, borderWidth: crustWidth },
        ]}
      />
      {/* Salsa y queso */}
      <View style={[styles.cheese, { width: inner, height: inner, borderRadius: inner / 2 }]} />
      <View
        style={[styles.sauce, { width: inner * 0.94, height: inner * 0.94, borderRadius: inner / 2 }]}
      />

      {marks.map((mark) => (
        <ToppingMark key={mark.key} mark={mark} scale={outer / 220} />
      ))}
    </View>
  );
}

function ToppingMark({ mark, scale }: { mark: Mark; scale: number }) {
  const topping = getTopping(mark.toppingId);
  if (!topping) return null;

  const unit = 14 * scale * mark.scale;
  const transform = [{ translateX: mark.x }, { translateY: mark.y }, { rotate: `${mark.rotation}deg` }];

  if (topping.shape === 'ring') {
    return (
      <View
        style={[
          styles.mark,
          {
            width: unit,
            height: unit,
            borderRadius: unit / 2,
            borderWidth: Math.max(2, unit * 0.22),
            borderColor: topping.color,
            transform,
          },
        ]}
      />
    );
  }

  if (topping.shape === 'leaf') {
    return (
      <View
        style={[
          styles.mark,
          {
            width: unit * 1.1,
            height: unit * 0.7,
            // Radios asimétricos: una hoja, no un óvalo.
            borderTopLeftRadius: unit,
            borderBottomRightRadius: unit,
            backgroundColor: topping.color,
            transform,
          },
        ]}
      />
    );
  }

  if (topping.shape === 'strip') {
    return (
      <View
        style={[
          styles.mark,
          {
            width: unit * 1.5,
            height: unit * 0.55,
            borderRadius: radius.sm,
            backgroundColor: topping.color,
            transform,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.mark,
        {
          width: unit * 0.85,
          height: unit * 0.85,
          borderRadius: unit,
          backgroundColor: topping.color,
          transform,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  crust: {
    position: 'absolute',
    backgroundColor: pizzaColor.crust,
    borderColor: pizzaColor.crustEdge,
  },
  cheese: { position: 'absolute', backgroundColor: pizzaColor.cheese },
  sauce: { position: 'absolute', backgroundColor: pizzaColor.sauce, opacity: 0.82 },
  mark: { position: 'absolute' },
});
