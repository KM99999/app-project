# Etapa 1 — Investigación y encuadre

## 1. La tesis del proyecto

Pedir pizza es **consumo repetido**. La misma persona pide casi lo mismo cada dos semanas.
Casi todas las apps del rubro tratan a un cliente que ya sabe qué quiere como si fuera un
visitante nuevo: lo hacen atravesar un catálogo completo, categorías, banners de promoción
y un buscador, para llegar a un producto que ya pidió cinco veces.

De ahí las dos apuestas del diseño:

1. **La recompra es una función de primera clase**, no un ítem escondido en "Mis pedidos".
2. **El armador es la pantalla más importante de la app.** Es donde se decide el ticket
   promedio y donde se pierde al usuario.

Todo lo demás —catálogo, promociones, perfil— es secundario a esos dos momentos.

---

## 2. Teardown de tres apps del rubro

Análisis heurístico de patrones públicos de las apps líderes de delivery de pizza.
No es investigación con usuarios; es lectura de decisiones de diseño ajenas.

### App A — Cadena internacional, armador tipo wizard

| | |
|---|---|
| **Patrón** | Armado en 4–5 pantallas separadas: tamaño → masa → salsa → ingredientes → resumen |
| **Funciona** | Cada paso es simple y difícil de equivocar. Bueno para usuarios de baja alfabetización digital |
| **No funciona** | Cada transición es una oportunidad de abandono. El precio aparece recién en el resumen. Volver atrás a cambiar el tamaño se siente costoso |
| **Qué tomamos** | El lenguaje claro por paso |
| **Qué evitamos** | La fragmentación en pantallas |

### App B — Marketplace multi-restaurante

| | |
|---|---|
| **Patrón** | Catálogo primero. La personalización es una hoja modal desde la ficha de producto |
| **Funciona** | La hoja modal mantiene el contexto: no perdés el catálogo de fondo. El total vive en una barra fija inferior |
| **No funciona** | La hoja modal crece hasta ocupar la pantalla completa y ahí el scroll interno pelea con el gesto de cerrar. Los recargos por ingrediente aparecen sin precio hasta el final |
| **Qué tomamos** | La barra de total fija e inferior |
| **Qué evitamos** | El scroll anidado en modal |

### App C — Cadena local, foco en recompra

| | |
|---|---|
| **Patrón** | La home abre con "tu último pedido" y un botón de repetir |
| **Funciona** | El camino a la conversión es de dos toques para el cliente recurrente. Es el patrón más valioso del rubro |
| **No funciona** | El bloque de recompra ocupa el mismo espacio aunque seas usuario nuevo, y entonces muestra un vacío inútil. No permite *editar* el pedido repetido antes de confirmar — es todo o nada |
| **Qué tomamos** | La recompra sobre el pliegue |
| **Qué mejoramos** | Repetir **con posibilidad de ajustar** antes de confirmar, y un estado vacío que sirva para algo cuando no hay historial |

### Síntesis

El diseño que proponemos toma la recompra de C, la barra de total de B y la claridad de
lenguaje de A, y resuelve lo que ninguna de las tres resuelve: **un armador en un solo
recorrido con el precio actualizándose a la vista.**

---

## 3. Mapa de supuestos

Estos son supuestos, no hallazgos. El presupuesto de la etapa 1 no cubre investigación con
usuarios reales. Se declaran acá para que quede explícito qué se está apostando, y se
ordenan por riesgo: si un supuesto de riesgo alto resulta falso, hay que rediseñar.

| # | Supuesto | Riesgo | Cómo se valida (etapa 2) |
|---|---|---|---|
| S1 | La mayoría del volumen viene de clientes recurrentes que repiten un pedido parecido | **Alto** | Analítica: % de pedidos de usuarios con ≥2 pedidos previos |
| S2 | El abandono en el armador se dispara cuando el monto sorprende al final | **Alto** | Embudo: caída entre "agregar al carrito" y "confirmar pedido" |
| S3 | El usuario decide el tamaño antes que los ingredientes | Medio | Test de usabilidad moderado, 5 personas |
| S4 | Un armador de un solo scroll no abruma a usuarios de poca experiencia digital | **Alto** | Test de usabilidad con el segmento explícito que Carlos mencionó |
| S5 | La ansiedad post-compra ("¿ya salió?") justifica una pantalla de seguimiento dedicada | Medio | Frecuencia de apertura de la app entre confirmación y entrega |
| S6 | Las mitades son un diferenciador deseado, pero no bloqueante para la v1 | Medio | Encuesta corta en la app / consulta al equipo del local |
| S7 | El usuario prefiere pagar en efectivo o transferencia sobre tarjeta guardada | Bajo | Mix de métodos de pago reales |

**S4 es el supuesto que más vigilo.** Carlos pidió explícitamente algo "sencillo para
usuarios que no tienen mucha experiencia con aplicaciones", y la decisión de un solo scroll
va en tensión con eso. La mitigación está en el diseño: secciones numeradas con
encabezados claros, una decisión por sección, y un indicador de progreso implícito. Si el
test de usabilidad lo contradice, el plan B es un armador híbrido — scroll único con
anclas de navegación por sección, sin volver al wizard.

---

## 4. Los dos usuarios que importan

No son personas ficticias con nombre y foto. Son dos modos de uso, y la misma persona
alterna entre ellos.

### Modo recompra — "ya sé qué quiero"

Es el 70% del volumen esperado (S1). Abre la app con hambre y sin paciencia. No quiere
explorar. Su recorrido ideal tiene **dos toques**: abrir → *Repetir pedido* → confirmar.

Todo lo que se interponga entre esos dos toques es fricción pura.

### Modo exploración — "veamos qué hay"

Primera vez, o antojo de algo distinto. Sí quiere ver opciones, pero se frustra si
personalizar se vuelve un trámite. Necesita entender el precio mientras decide, no después.

**Consecuencia de diseño:** la home tiene que servir a los dos sin obligar a ninguno a
pasar por el camino del otro. Por eso la recompra va arriba y colapsada, y el catálogo
sigue inmediatamente debajo — no en otra pestaña.

---

## 5. Dónde se pierde la conversión

Los cuatro puntos de fuga, en orden de impacto:

1. **El precio sorprende al final.** Se resuelve con precio en vivo en el armador y
   desglose completo antes de confirmar. Sin costos revelados en el último paso.
2. **El armador se siente largo.** Se resuelve con un solo recorrido, valores por defecto
   sensatos (tamaño mediana + masa clásica preseleccionados) y la posibilidad de agregar al
   carrito sin tocar nada.
3. **El recurrente tiene que volver a elegir todo.** Se resuelve con la recompra en la home.
4. **El silencio post-compra.** Se resuelve con seguimiento con estados claros y tiempo
   estimado visible.
