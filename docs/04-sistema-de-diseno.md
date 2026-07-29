# Etapa 4 — Sistema de diseño

Todo lo de este documento está implementado en
[`src/design-system/tokens.ts`](../src/design-system/tokens.ts). Ese archivo es la fuente
de verdad; este documento explica el porqué.

**Origen del lenguaje visual.** La paleta, la escala tipográfica, los radios y las sombras
están alineados con el design system del panel de administración (NextAdmin): índigo como
color de acción, tinta azul-negra, superficies blancas sobre gris frío. Así la app de
cliente y el panel interno se leen como un mismo producto.

---

## 1. La idea que ordena la paleta

**El chrome es frío y neutro; la comida es cálida.**

La interfaz —botones, tarjetas, controles, tipografía— usa índigo y grises azulados. La
ilustración de la pizza conserva su paleta cálida sin tocar.

No es un capricho estético. Es lo que hacen las plataformas de delivery serias: si la
interfaz compite en saturación con el producto, la comida deja de ser lo que atrae la
vista. Un chrome neutro enmarca, no compite. Y de paso es lo que le da el aire de producto
moderno en lugar de folleto.

---

## 2. Color

### Marca y acción

| Token | Valor | Uso | Contraste sobre blanco |
|---|---|---|---|
| `brand` | `#5750F1` | Acciones primarias, precios, seleccionado | **5.49:1** ✅ AA |
| `brandPressed` | `#4338CA` | Estado presionado | — |
| `brandSoft` | `#EEF2FF` | Fondo de chips y filas seleccionadas | fondo |
| `brandBorder` | `#C7D2FE` | Borde de botón secundario | fondo |

### Estados semánticos — leer con atención

Tres colores de la paleta de origen **no pasan AA como texto**. Se conservan como relleno
y se agregan variantes oscuras para texto. Por eso hay tokens separados: no es
duplicación, es lo que evita que un estado quede ilegible.

| Token | Valor | Contraste | Uso permitido |
|---|---|---|---|
| `success` | `#1A8245` | **4.86:1** ✅ AA | Texto e iconos |
| `successFill` | `#22AD5C` | 2.9:1 ❌ | **Solo relleno** (puntos, barras) |
| `warning` | `#B45309` | **5.24:1** ✅ AA | Texto |
| `warningFill` | `#F59E0B` | 3.2:1 ❌ | **Solo relleno** |
| `danger` | `#E10E0E` | **4.92:1** ✅ AA | Texto de error, bordes inválidos |

Los rellenos se rigen por el criterio de contraste **no textual** (3:1), que sí cumplen.
Un punto de la línea de tiempo es una forma, no una palabra.

### Tinta y superficie

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `ink` | `#111928` | Texto principal | **17.6:1** ✅ AAA |
| `inkSecondary` | `#6B7280` | Descripciones, etiquetas | **4.83:1** ✅ AA |
| `inkMuted` | `#9CA3AF` | ⚠️ Iconos inactivos, bordes, placeholders | **2.54:1** ❌ |
| `inkDisabled` | `#D1D5DB` | Deshabilitado | sin requisito |
| `surface` | `#FFFFFF` | Tarjetas, barras, encabezados | — |
| `surfaceSunken` | `#F9FAFB` | Fondo de la app | — |
| `surfaceMuted` | `#F3F4F6` | Pistas de controles, rellenos | — |
| `border` | `#E6EBF1` | Bordes de tarjetas | — |
| `borderStrong` | `#D1D5DB` | Bordes de campos de texto | — |

**`inkMuted` no es apto para texto** y la restricción se respeta en el código: se usa solo
en iconos inactivos de la barra de pestañas, bordes y placeholders.

### La regla que gobierna toda la paleta

**Ningún estado se comunica solo por color.** Siempre hay un segundo canal, y en el
seguimiento hay tres:

| Elemento | Canal 1 | Canal 2 | Canal 3 |
|---|---|---|---|
| Fila de opción seleccionada | fondo teñido | borde índigo | marca del indicador |
| Tarjeta de tamaño seleccionada | fondo teñido | borde de 2px | tilde en la esquina |
| Segmento activo | relleno pleno | color de texto invertido | — |
| Paso del seguimiento | color | peso tipográfico | forma del indicador |

---

## 3. Tipografía

**Fuente del sistema** — SF Pro en iOS, Roboto en Android. El original usa Satoshi como
archivo local que este proyecto no tiene; cargar una fuente propia agregaría peso al bundle
y un parpadeo de carga. **La jerarquía viene del tamaño y del peso, no del nombre de la
familia**, y el `letterSpacing` negativo en los títulos aporta buena parte del aire
compacto que caracteriza al original.

| Token | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `display` | 32 / 40 | 700 | Título de pantalla raíz |
| `h1` | 28 / 36 | 700 | ETA del seguimiento |
| `h2` | 22 / 28 | 700 | Títulos de sección |
| `h3` | 18 / 24 | 600 | Encabezados de tarjeta y de paso |
| `metric` | 24 / 30 | 700 | Números de las tarjetas de resumen |
| `body` | 15 / 23 | 400 | Texto general |
| `bodyStrong` | 15 / 23 | 600 | Etiquetas de botón, opción elegida |
| `caption` | 14 / 22 | 400 | Descripciones |
| `captionStrong` | 14 / 22 | 600 | Recargos, enlaces |
| `micro` | 12 / 20 | 500 | Etiquetas, marcas de tiempo |

---

## 4. Forma, espacio y elevación

**Grilla de 8**, con 4 y 6 como medios pasos para ajustes ópticos.

**Radios.** `5` indicadores · `7` controles internos · `9` botones y campos ·
**`10` tarjetas** · `999` píldoras. El radio de 10 es la firma del sistema de origen: más
contenido que el redondeo blando de las apps de consumo, y buena parte de por qué se lee
como producto serio.

**Elevación.** Sombras muy tenues y de radio corto. La diferencia entre una interfaz que se
ve moderna y una que se ve inflada suele estar acá.

| Token | Sombra | Uso |
|---|---|---|
| `card` | `0 1px 2px rgba(84,87,118,.12)` | Toda tarjeta |
| `raised` | `0 4px 8px rgba(84,87,118,.15)` | Bloque de recompra |
| `bar` | `0 -4px 16px rgba(17,25,40,.08)` | Barra fija inferior |

---

## 5. Accesibilidad

| Regla | Cómo se cumple |
|---|---|
| Área táctil mínima 48×48 | `touchTarget = 48`; `hitSlop` cuando el pixel visible es menor |
| Contraste AA en todo el texto | Tablas de la sección 2, con los rellenos separados de los tonos de texto |
| Sin dependencia del color | Regla de la sección 2 |
| Roles semánticos | `accessibilityRole` de `button`, `radio`, `checkbox`, `image` |
| Estado anunciado | `accessibilityState={{ checked, disabled, busy }}` |
| Etiquetas con contexto | "Napolitana, desde $8.900", no "Napolitana" a secas |
| Etiquetas persistentes | Los campos llevan etiqueta arriba, no un placeholder que se borra |
| Zona del pulgar | Toda acción primaria vive en la barra fija inferior |

---

## 6. Componentes

En [`src/design-system/`](../src/design-system/). Cada uno trae sus estados resueltos.

| Componente | Archivo | Notas |
|---|---|---|
| `Text` | `text.tsx` | Único punto de entrada tipográfico |
| `Button` | `button.tsx` | `primary` · `secondary` · `ghost`; admite monto en el trailing |
| `Card`, `CardBare`, `Divider` | `primitives.tsx` | Contenedores |
| `SectionHeader` | `primitives.tsx` | Número en cápsula índigo + marca de "Opcional" |
| **`StatTile`** | `primitives.tsx` | Métrica grande + etiqueta chica. El elemento de firma del panel |
| `OptionRow` | `primitives.tsx` | Radio o checkbox con recargo |
| `ChoiceCard` | `primitives.tsx` | Tarjeta comparativa (tamaños) |
| `Segmented` | `primitives.tsx` | Modos excluyentes, con relleno pleno en el activo |
| `Field` | `primitives.tsx` | Campo con etiqueta persistente y estado inválido |
| `Stepper` | `primitives.tsx` | Cantidad; en 1, "–" elimina |
| `Badge`, `Chip`, `PriceRow` | `primitives.tsx` | Señales y desglose |
| `Screen`, `ScreenHeader`, `StickyBar` | `screen.tsx` | Estructura y área segura |
| **`Icon`** | `icon.tsx` | Envoltorio de Ionicons seguro para el export estático — ver abajo |

### Fotografía de producto

El catálogo usa **fotografía real**, empaquetada con la app (`require`) y no traída por
red: el prototipo abre sin conexión y sin estados de carga.

Las seis pizzas tienen foto propia, elegida para que se corresponda con la descripción
—la Napolitana lleva tomate y albahaca, la Calabresa pepperoni, la Fugazzeta es blanca sin
salsa—. Emparejarlas al azar habría sido más rápido y se habría notado enseguida.

Las imágenes se redujeron a 900px de ancho y calidad 82: **708 KB las seis**, contra los
2,4 MB de los originales. En una pantalla de catálogo eso es la diferencia entre entrar de
una y ver los huecos cargarse.

**Bebidas, acompañamientos y postres no tienen foto** porque el material provisto solo
traía pizzas. En lugar de rellenar con una imagen genérica que no es el producto, esas
tarjetas usan un panel tintado con la inicial: se lee como decisión y no como imagen
faltante, y se reemplaza el día que haya fotos reales.

*(Antes existía `PizzaArt`, una ilustración procedural que dibujaba los ingredientes con
Views nativas. Se retiró al incorporar fotografía: mantener las dos habría sido dos
lenguajes visuales compitiendo en la misma pantalla.)*

### `Icon`

Envoltorio de Ionicons que **no dibuja nada en el primer render** y reserva un hueco del
mismo tamaño hasta el montaje. Ver §8: la fuente de iconos no existe en el build, y
dibujarla durante la hidratación rompe la página.

---

## 7. Preparación para mitades

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
Sin migración de datos, sin refactor del carrito, sin tocar el motor de precios.

---

## 8. Layout responsivo

La app nació como diseño móvil. En una pantalla ancha ese layout se estira: las tarjetas de
métricas se separan hasta perder relación entre sí y una fila de menú cruza 1900px, con la
ilustración en un extremo y el precio en el otro.

**Corte en 1024px** (el `lg` del panel de origen), en
[`layout.tsx`](../src/design-system/layout.tsx).

| | Móvil (< 1024) | Escritorio (≥ 1024) |
|---|---|---|
| Navegación | Barra de pestañas inferior | **Barra lateral** de 280px |
| Menú | Una columna | Dos columnas |
| Las más pedidas | Scroll horizontal | Todas desplegadas |
| Ancho del contenido | Todo el ancho | 1120 en grilla · 760 en una columna |

### La barra lateral

En el formato del panel: marca arriba, ítems agrupados bajo epígrafes en mayúsculas
(`PRINCIPAL`, `CATÁLOGO`) y el activo en índigo suave.

Sus ítems son de dos clases y se comportan distinto **a propósito**:

- **Rutas** — `Inicio`, `Carrito` — navegan.
- **Secciones** — `Las más pedidas`, `Todo el menú` — desplazan dentro de Inicio, porque
  son partes de una misma página y no destinos separados. Convertirlas en rutas obligaría
  a recargar para volver a ver el catálogo completo.

Vive en el **layout raíz**, no en el grupo de pestañas. Si viviera en las pestañas
desaparecería al abrir el Constructor o el Checkout, que son pantallas de la pila, y el
marco de la aplicación se desarmaría a mitad del flujo.

El canal entre la barra y la pantalla es
[`section-nav.tsx`](../src/store/section-nav.tsx): la barra pide el desplazamiento y la
pantalla, que es la que tiene el ref del scroll, obedece. El pedido lleva un `nonce`
incremental además del nombre de la sección — sin él, tocar dos veces el mismo ítem no
cambiaría el estado y el segundo toque no haría nada.

### La trampa del export estático

`useIsWide()` devuelve **`false` en el primer render**, aunque la ventana ya sea ancha, y
recién toma su valor real al montarse.

El export es estático: el HTML se genera en el build, donde no hay ventana. Si el hook
devolviera el ancho real de entrada, el servidor pintaría el árbol móvil y el cliente el de
escritorio, y React abortaría la hidratación por diferencia de estructura. Es el mismo
error #418 que apareció con el saludo según la hora, pero peor: ahí cambiaba un texto, acá
cambiaría el árbol entero.

**Regla general para este proyecto:** nada que dependa de la hora, del ancho de ventana o
de cualquier dato que no exista en el build puede decidirse durante el primer render.

Ya mordió tres veces, y conviene tenerlas presentes porque **el build termina en verde en
las tres**: el problema solo aparece cuando el navegador hidrata.

| # | Qué lo causó | Cómo se resolvió |
|---|---|---|
| 1 | Saludo según la hora (`new Date()` en el render) | Se calcula en un efecto, tras el montaje |
| 2 | Layout según el ancho de ventana | `useIsWide()` devuelve `false` en el primer render |
| 3 | Iconos de `@expo/vector-icons` (la fuente no está en el build) | `Icon` dibuja un hueco del mismo tamaño hasta montarse |

El caso 3 se localizó **midiendo, no adivinando**: de las cuatro rutas, las dos que
fallaban eran exactamente las dos que dibujaban iconos en el contenido de la página. La
herramienta común es `useMounted()`, en [`layout.tsx`](../src/design-system/layout.tsx).

---

## 9. Lo que este sistema deja afuera

**Es de tema claro únicamente.** El panel de origen trae tema oscuro (`gray-dark #122031`,
`dark-2 #1F2A37`), y portarlo pide una segunda paleta completa con su propia verificación
de contraste. La arquitectura no lo impide —todo el color sale de tokens— pero no está
hecho, y decir lo contrario sería vender algo que no está.
