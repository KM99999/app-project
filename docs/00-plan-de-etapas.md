# Plan de etapas — App de delivery de pizzas

**Cliente:** Carlos
**Diseño y desarrollo:** Joao
**Presupuesto acordado:** USD 100 · **Plazo:** 1 semana
**Marca de trabajo:** *Forno* (nombre placeholder — se reemplaza cuando definas la marca real)

---

## Decisiones ya cerradas en la conversación

Estas no se rediscuten durante la ejecución; quedan documentadas para que el equipo de
desarrollo tenga una única fuente de verdad.

| # | Decisión | Estado |
|---|---|---|
| 1 | El armado de pizza va en **un solo recorrido**, no en un wizard de varios pasos | Cerrada |
| 2 | El **precio se actualiza a la vista** y el total está siempre presente | Cerrada |
| 3 | v1 con **combinaciones fijas + personalización básica**; mitades quedan para v2 | Cerrada |
| 4 | La arquitectura de datos se diseña **lista para mitades** desde el día uno | Cerrada |
| 5 | Se incluye **"Repetir último pedido"** como camino de dos toques | Cerrada |
| 6 | Convenciones **Material Design 3 + iOS HIG**, implementable en RN o Flutter | Cerrada |
| 7 | Alcance de la etapa 1 = 5 pantallas núcleo | Cerrada |

---

## Las 6 etapas

### Etapa 1 — Investigación y encuadre (día 1)

**Qué se hace:** teardown de tres apps del rubro, mapa de supuestos explícito,
definición de los dos momentos donde se decide la conversión.

**Por qué:** entrar con foco y sin inventar usuarios. El presupuesto de esta etapa no
cubre investigación con usuarios reales, así que los supuestos se declaran como
supuestos — no se disfrazan de hallazgos.

**Entrega:** [`01-investigacion.md`](01-investigacion.md)

---

### Etapa 2 — Flujos de usuario (día 1–2)

**Qué se hace:** los tres caminos que importan (recompra, pedido nuevo, seguimiento),
diagramados hasta el nivel de decisión y estado de error.

**Por qué:** el flujo define la pantalla, no al revés. Diagramar primero evita diseñar
pantallas huérfanas.

**Entrega:** [`02-flujos-de-usuario.md`](02-flujos-de-usuario.md)

---

### Etapa 3 — Wireframes (día 2–3)

**Qué se hace:** wireframes de baja fidelidad de las 5 pantallas núcleo, con la jerarquía
de contenido y la zona del pulgar resueltas antes de tocar color.

**Por qué:** separar "qué va en la pantalla y en qué orden" de "cómo se ve" hace que las
discusiones de layout no se contaminen con discusiones de estética.

**Entrega:** [`03-wireframes.md`](03-wireframes.md)

---

### Etapa 4 — Sistema de diseño (día 3–4)

**Qué se hace:** tokens de color, tipografía, espaciado, radios y elevación; componentes
con sus estados; verificación de contraste AA; tamaños mínimos de toque.

**Por qué:** es lo que permite que la etapa 2 del proyecto (onboarding, perfil, historial,
promociones, panel del repartidor) se diseñe rápido y consistente, sin volver a empezar.

**Entrega:** [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md) + `design-system/` en código

---

### Etapa 5 — Prototipo interactivo de alta fidelidad (día 4–6)

**Qué se hace:** las 5 pantallas construidas como **aplicación React Native funcional**,
no como un archivo de Figma con hotspots.

**Por qué esto en lugar de un prototipo clickeable:** el prototipo real navega, calcula
precios de verdad, mantiene el carrito y responde al tamaño de pantalla. Carlos lo abre en
su teléfono y lo prueba; el equipo de desarrollo lo continúa en lugar de reimplementarlo
mirando capturas. Es el mismo entregable, con más valor por el mismo presupuesto.

**Entrega:** app corriendo en iOS, Android y web

---

### Etapa 6 — Handoff a desarrollo (día 6–7)

**Qué se hace:** la checklist de diseño móvil prometida en la conversación, más las notas
de implementación y el mapa de qué queda para la etapa 2.

**Entrega:** [`06-handoff-desarrollo.md`](06-handoff-desarrollo.md) y
[`05-alcance-y-entregables.md`](05-alcance-y-entregables.md)

---

## Qué entra y qué no en esta etapa

**Incluido (USD 100):**

- Investigación inicial y mapa de supuestos
- Flujos de usuario principales
- Wireframes
- Sistema de diseño con tokens y componentes
- Prototipo interactivo de alta fidelidad
- Diseño final de: Inicio · Constructor · Carrito · Checkout · Seguimiento

**No incluido — se cotiza como etapa 2:**

- Investigación con usuarios reales (entrevistas, tests de usabilidad)
- Onboarding completo y registro
- Perfil de usuario e historial avanzado
- Promociones y cupones
- Panel del repartidor
- Pizzas por mitades (la arquitectura queda lista; falta el diseño de la interacción)
- Backend, pasarela de pago real, integración con el sistema de la pizzería

La etapa 2 se hace sobre el mismo sistema de diseño ya montado, así que rinde bastante más
por hora que la etapa 1.
