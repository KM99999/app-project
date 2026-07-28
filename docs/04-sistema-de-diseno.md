# Etapa 4 — Sistema de diseño

Todo lo de este documento está implementado en
[`src/design-system/tokens.ts`](../src/design-system/tokens.ts). Ese archivo es la fuente
de verdad; este documento explica el porqué.

---

## 1. Color

Paleta cálida. Los grises son cálidos (con carga de rojo), no neutros: un gris puro sobre
un fondo cálido se ve sucio.

### Marca y estados

| Token | Valor | Uso | Contraste sobre blanco |
|---|---|---|---|
| `brand` | `#C8321E` | Acciones primarias, precios, seleccionado | **5.35:1** ✅ AA |
| `brandPressed` | `#A32717` | Estado presionado del botón primario | — |
| `brandSoft` | `#FDEDE9` | Fondo de chips y filas seleccionadas | fondo, no lleva texto |
| `success` | `#1F7A4D` | Pasos completados, envío gratis | **4.85:1** ✅ AA |
| `warning` | `#B45309` | Paso en curso del seguimiento | **5.24:1** ✅ AA |

### Texto y superficie

| Token | Valor | Uso | Contraste sobre blanco |
|---|---|---|---|
| `ink` | `#1A1614` | Texto principal | **15.8:1** ✅ AAA |
| `inkSecondary` | `#57504C` | Descripciones, etiquetas | **7.9:1** ✅ AAA |
| `inkMuted` | `#8A817C` | ⚠️ Solo ≥18.66px bold, iconos y bordes | **3.81:1** ⚠️ AA large |
| `inkDisabled` | `#C9C2BD` | Deshabilitado | sin requisito |
| `surface` | `#FFFFFF` | Tarjetas, barras, encabezados | — |
| `surfaceSunken` | `#F7F4F1` | Fondo de la app | — |
| `border` | `#E7E2DE` | Bordes de tarjetas y controles | — |

**La restricción de `inkMuted` es real y se respeta en el código.** Con 3.81:1 pasa AA
para texto grande y para elementos no textuales, pero no para texto de cuerpo. Se usa
solamente en marcas de tiempo, iconos inactivos de la barra de pestañas y bordes.

### La regla que gobierna toda la paleta

**Ningún estado se comunica solo por color.** Siempre hay un segundo canal, y en el
seguimiento hay tres:

| Elemento | Canal 1 | Canal 2 | Canal 3 |
|---|---|---|---|
| Fila de opción seleccionada | color de fondo | color de borde | marca del indicador |
| Tarjeta de tamaño seleccionada | fondo teñido | borde de 2px | punto en la esquina |
| Paso del seguimiento | color | peso tipográfico | forma del indicador |

Un estado que se distingue solo por tinte es un estado invisible para buena parte de los
usuarios con daltonismo.

---

## 2. Tipografía

**Fuente del sistema** — SF Pro en iOS, Roboto en Android. Sin fuentes personalizadas, y
es una decisión, no una omisión: respeta la configuración de tamaño de texto del usuario,
no suma peso al bundle, no genera parpadeo de carga, y es lo que esperan tanto HIG como
Material 3.

| Token | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `display` | 32 / 38 | 700 | Título de pantalla raíz |
| `h1` | 24 / 30 | 700 | Total en el Constructor, ETA |
| `h2` | 20 / 26 | 600 | Encabezados de sección |
| `h3` | 17 / 22 | 600 | Título de tarjeta, precio de línea |
| `body` | 16 / 24 | 400 | Texto general |
| `bodyStrong` | 16 / 24 | 600 | Etiquetas de botón, opción elegida |
| `caption` | 14 / 20 | 400 | Descripciones |
| `captionStrong` | 14 / 20 | 600 | Recargos, enlaces |
| `micro` | 12 / 16 | 500 | Etiquetas, marcas de tiempo |

Mínimo 12px, y solo para contenido accesorio. Todo el texto de lectura está en 14 o más.

---

## 3. Espaciado y forma

**Grilla de 8.** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40`. El 4 existe solamente como medio
paso para ajustes ópticos (separación icono-texto, padding interno de un chip).

**Radios.** `8` controles pequeños · `12` botones y campos · `16` tarjetas · `24` hojas ·
`999` píldoras y puntos.

**Elevación.** Dos niveles y nada más: `card` (sombra suave hacia abajo) y `bar` (sombra
hacia arriba para la barra fija). La sombra es cálida, no gris.

---

## 4. Accesibilidad

| Regla | Cómo se cumple |
|---|---|
| Área táctil mínima 48×48 | `touchTarget = 48` en botones, filas y controles; `hitSlop` cuando el pixel visible es menor |
| Contraste AA en todo el texto | Tabla de la sección 1; `inkMuted` restringido por token |
| Sin dependencia del color | Regla de la sección 1, tres canales en el seguimiento |
| Roles semánticos | `accessibilityRole` de `button`, `radio`, `checkbox`, `image` en cada control |
| Estado anunciado | `accessibilityState={{ checked, disabled, busy }}` |
| Etiquetas con contexto | "Napolitana, desde $8.900", no "Napolitana" a secas |
| Etiquetas persistentes | Los campos llevan etiqueta arriba, no un placeholder que se borra al escribir |
| Zona del pulgar | Toda acción primaria vive en la barra fija inferior |

---

## 5. Componentes

En [`src/design-system/`](../src/design-system/). Cada uno trae sus estados resueltos.

| Componente | Archivo | Notas |
|---|---|---|
| `Text` | `text.tsx` | Único punto de entrada tipográfico |
| `Button` | `button.tsx` | `primary` · `secondary` · `ghost`; soporta monto en el trailing |
| `Card`, `Divider` | `primitives.tsx` | Contenedores |
| `SectionHeader` | `primitives.tsx` | Numerado, con marca de "Opcional" |
| `OptionRow` | `primitives.tsx` | Radio o checkbox con recargo |
| `ChoiceCard` | `primitives.tsx` | Tarjeta comparativa (tamaños) |
| `Segmented` | `primitives.tsx` | Modos excluyentes (delivery / retiro) |
| `Field` | `primitives.tsx` | Campo con etiqueta persistente |
| `Stepper` | `primitives.tsx` | Cantidad; en 1, "–" elimina |
| `Badge`, `Chip`, `PriceRow` | `primitives.tsx` | Señales y desglose |
| `Screen`, `ScreenHeader`, `StickyBar` | `screen.tsx` | Estructura y área segura |
| `PizzaArt` | `pizza-art.tsx` | Ilustración procedural — ver abajo |

### `PizzaArt`

Dibuja la pizza con Views nativas a partir de la configuración actual: cada ingrediente
que se agrega aparece sobre la masa en el momento.

Generada y no fotográfica porque refleja la configuración real —cosa que una foto de
catálogo no puede hacer—, no tiene estados de carga ni saltos de layout, y deja el
prototipo autocontenido: funciona sin red, en iOS, Android y web.

Las posiciones son deterministas (ángulo áureo indexado, sin `Math.random()`): con
aleatoriedad, cada re-render reacomodaría los ingredientes y la pizza titilaría con cada
toque.

**Para producción:** fotografía real en el catálogo, ilustración dentro del Constructor,
que es donde aporta.

---

## 6. Preparación para mitades

La decisión que Carlos planteó, resuelta en la arquitectura.

Cada ingrediente elegido carga un campo `half` desde el día uno:

```ts
type PizzaHalf = 'whole' | 'left' | 'right';

type ToppingSelection = {
  toppingId: string;
  half: PizzaHalf;   // v1 emite siempre 'whole'
};
```

En la v1 el único valor emitido es `'whole'`, porque `FEATURES.halves` está en `false` y
la interfaz no ofrece otra cosa. Pero **ya saben interpretar `'left'` y `'right'`**:

- el motor de precios ([`pricing.ts`](../src/domain/pricing.ts)) aplica
  `HALF_PRICE_FACTOR = 0.5` a los ingredientes de un solo lado;
- la ilustración ([`pizza-art.tsx`](../src/design-system/pizza-art.tsx)) refleja las marcas
  al lado que corresponde;
- el resumen del carrito escribe `"Jamón (izq.)"`;
- el carrito y el pedido guardan la selección completa.

**Habilitar mitades en la v2 = poner el flag en `true` y diseñar el selector por lado.**
Sin migración de datos, sin refactor del carrito, sin tocar el motor de precios. La
sección 3 del Constructor ya tiene lugar para un control `Toda / Izquierda / Derecha` por
ingrediente sin mover nada más de la pantalla.

---

## 7. Lo que este sistema deja afuera

Honestidad de alcance: **el sistema es de tema claro únicamente.** El tema oscuro pide una
segunda paleta completa con su propia verificación de contraste, y eso es etapa 2. La
arquitectura no lo impide —todo el color sale de tokens— pero no está hecho, y decir lo
contrario sería vender algo que no está.
