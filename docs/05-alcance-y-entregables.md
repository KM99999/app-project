# Etapa 5 — Alcance y entregables

## Lo entregado (USD 100)

### Documentación de diseño

| Entregable | Dónde | Estado |
|---|---|---|
| Plan de etapas | [`00-plan-de-etapas.md`](00-plan-de-etapas.md) | ✅ |
| Investigación inicial y teardown | [`01-investigacion.md`](01-investigacion.md) | ✅ |
| Mapa de supuestos | [`01-investigacion.md §3`](01-investigacion.md) | ✅ |
| Flujos de usuario | [`02-flujos-de-usuario.md`](02-flujos-de-usuario.md) | ✅ |
| Wireframes | [`03-wireframes.md`](03-wireframes.md) | ✅ |
| Sistema de diseño | [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md) | ✅ |
| Checklist de handoff | [`06-handoff-desarrollo.md`](06-handoff-desarrollo.md) | ✅ |

### Prototipo interactivo

No es un archivo con hotspots: es una **aplicación React Native funcional**. Navega,
calcula precios de verdad, mantiene el carrito entre pantallas y responde al tamaño del
dispositivo. Corre en iOS, Android y web desde el mismo código.

| Pantalla | Ruta | Estado |
|---|---|---|
| Inicio | [`src/app/(tabs)/index.tsx`](../src/app/(tabs)/index.tsx) | ✅ |
| Constructor de pizza | [`src/app/constructor/[pizzaId].tsx`](../src/app/constructor/[pizzaId].tsx) | ✅ |
| Carrito | [`src/app/(tabs)/carrito.tsx`](../src/app/(tabs)/carrito.tsx) | ✅ |
| Checkout | [`src/app/checkout.tsx`](../src/app/checkout.tsx) | ✅ |
| Seguimiento del pedido | [`src/app/seguimiento/[orderId].tsx`](../src/app/seguimiento/[orderId].tsx) | ✅ |

### Funcionalidad que quedó operativa

- Repetir último pedido en dos toques, con el carrito editable antes de confirmar
- Armado en un solo recorrido con precio en vivo
- Recargos escalados por tamaño, visibles en el punto de decisión
- Ilustración de la pizza que refleja la configuración en el momento
- Carrito con desglose, cantidades y edición de cada línea
- Envío gratis por umbral, con indicador de cuánto falta
- Checkout con delivery o retiro, tres métodos de pago y validación de dirección
- Seguimiento con cinco estados y avance simulado
- Estados vacíos resueltos en carrito y catálogo

---

## Lo que NO está incluido

Se dijo desde la propuesta y se sostiene acá. Nada de esto está a medias: está fuera.

### Segunda etapa de diseño

| Pendiente | Por qué quedó afuera |
|---|---|
| **Investigación con usuarios reales** | Entrevistas y tests de usabilidad no entran en USD 100. Los supuestos S1–S7 están declarados como supuestos justamente por esto |
| **Onboarding y registro** | Flujo completo con verificación de teléfono |
| **Perfil e historial avanzado** | Direcciones múltiples, medios de pago guardados, repetir cualquier pedido y no solo el último |
| **Promociones y cupones** | Requiere definir las reglas de negocio antes de diseñar |
| **Panel del repartidor** | Es otra aplicación, con otro usuario y otro contexto de uso |
| **Pizzas por mitades** | La arquitectura está lista (ver [`04 §6`](04-sistema-de-diseno.md)); falta diseñar la interacción del selector por lado |
| **Tema oscuro** | Pide una segunda paleta completa con su propia verificación de contraste |

### Fuera del alcance de diseño

Backend, autenticación real, pasarela de pago, notificaciones push, integración con el
sistema de la cocina, analítica. Son trabajo de desarrollo, no de diseño.

---

## Lo que está simulado en el prototipo

Explícito para que nadie confunda un prototipo con un producto terminado:

| Simulado | Dónde | En producción |
|---|---|---|
| Catálogo y precios | [`domain/menu.ts`](../src/domain/menu.ts) | API del comercio |
| Avance del pedido | `SIMULATED_STEP_MS`, cada 7 s | Websocket o push desde la cocina |
| Pedido anterior | `seedPreviousOrder()` | Historial del usuario |
| Usuario y dirección | Constantes | Perfil autenticado |
| Pago | Sin cobro real | Pasarela |

El estado vive en memoria: **al recargar la app se reinicia.** Es adrede — para probar el
flujo desde cero muchas veces seguidas. Persistirlo es trabajo de la etapa 2.

---

## Cómo evaluar esto

Sugerencia de recorrido, en este orden:

1. **Abrir la app y tocar "Repetir pedido".** Cronometrar cuántos toques hay hasta el
   pedido confirmado. Ese es el camino que recorre la mayor parte del volumen.
2. **Entrar al Constructor y no tocar nada.** Comprobar que se puede agregar al carrito
   directamente, con valores por defecto sensatos.
3. **Cambiar el tamaño a Grande.** Mirar el total de la barra fija y los recargos de los
   ingredientes: los dos se actualizan.
4. **Llegar al checkout.** Verificar que el total del paso 3 es el mismo del botón y el
   mismo del carrito. Sin sorpresas.
5. **Confirmar y esperar.** El seguimiento avanza cada 7 segundos.

La pregunta que vale la pena hacerse en cada paso: *¿en qué momento me habría ido de la
app?*
