# Forno — app de delivery de pizzas

Diseño UI/UX y prototipo interactivo de alta fidelidad para una aplicación móvil de
entrega de pizzas.

*Forno* es un nombre de trabajo: se reemplaza cuando esté definida la marca real.

---

## Qué es esto

El entregable pedido era investigación, flujos, wireframes, prototipo interactivo y
diseño final de las pantallas principales.

El prototipo interactivo está resuelto como **una aplicación React Native funcional** en
lugar de un archivo con hotspots. Navega de verdad, calcula los precios de verdad,
mantiene el carrito entre pantallas y se adapta al tamaño del dispositivo. Se abre en el
teléfono y se prueba; el equipo de desarrollo lo continúa en lugar de reimplementarlo
mirando capturas.

La documentación de diseño está completa y vive en [`docs/`](docs/).

---

## Las dos ideas que ordenan todo el diseño

**1 · Pedir pizza es consumo repetido.** La misma persona pide casi lo mismo cada dos
semanas, y casi todas las apps del rubro la obligan a atravesar un catálogo completo para
llegar a un producto que ya pidió cinco veces. Acá "Repetir pedido" está sobre el pliegue
de la home, y lleva al carrito —no al checkout— para que se pueda ajustar antes de
confirmar.

**2 · El armador es donde se pierde al usuario.** Un solo recorrido en vez de un wizard
de cuatro pantallas, valores por defecto que permiten agregar al carrito sin tocar nada, y
el precio actualizándose a la vista con los recargos mostrados en el punto de decisión.
El abandono aparece cuando el monto sorprende al final.

---

## Documentación

| Documento | Contenido |
|---|---|
| [00 · Plan de etapas](docs/00-plan-de-etapas.md) | Las 6 etapas y las decisiones ya cerradas |
| [01 · Investigación](docs/01-investigacion.md) | Teardown de 3 apps, mapa de supuestos, puntos de fuga |
| [02 · Flujos de usuario](docs/02-flujos-de-usuario.md) | Recompra, pedido nuevo, checkout y seguimiento |
| [03 · Wireframes](docs/03-wireframes.md) | Las 5 pantallas en baja fidelidad, con el porqué de cada decisión |
| [04 · Sistema de diseño](docs/04-sistema-de-diseno.md) | Tokens, contraste AA, componentes, preparación para mitades |
| [05 · Alcance y entregables](docs/05-alcance-y-entregables.md) | Qué entra, qué no, y qué está simulado |
| [06 · Handoff a desarrollo](docs/06-handoff-desarrollo.md) | Checklist de diseño móvil y notas de implementación |

---

## Cómo correrlo

Requiere Node 20 o superior.

```bash
npm install

npm start        # elegí plataforma desde el menú de Expo
npm run ios      # simulador de iOS
npm run android  # emulador de Android
npm run web      # navegador
```

Para probarlo en un teléfono real: instalá **Expo Go**, corré `npm start` y escaneá el
código QR.

```bash
npm run typecheck   # tsc --noEmit
npm run build:web   # export estático a dist/
```

---

## Recorrido sugerido

1. **Tocá "Repetir pedido"** y contá los toques hasta el pedido confirmado. Ese es el
   camino de la mayor parte del volumen.
2. **Entrá al Constructor y no toques nada.** Se puede agregar al carrito directamente.
3. **Cambiá el tamaño a Grande.** El total y los recargos por ingrediente se actualizan a
   la vez.
4. **Llegá al checkout.** El total del resumen, el del botón y el del carrito son el mismo
   número.
5. **Confirmá y esperá.** El seguimiento avanza cada 7 segundos.

En cada paso vale la pena preguntarse: *¿en qué momento me habría ido de la app?*

---

## Estructura

```
src/
  app/                      Rutas (expo-router)
    (tabs)/index.tsx          Inicio
    (tabs)/carrito.tsx        Carrito
    constructor/[pizzaId]     Constructor de pizza
    checkout.tsx              Checkout
    seguimiento/[orderId]     Seguimiento del pedido
  design-system/            Tokens y componentes compartidos
    tokens.ts                 Fuente de verdad de color, tipografía y espaciado
    sidebar.tsx               Navegación de escritorio
    icon.tsx                  Iconos seguros para el export estático
  domain/                   Modelo, catálogo y motor de precios
  store/                    Carrito, preferencias e historial
docs/                       Documentación de diseño
```

---

## Notas de alcance

El estado vive en memoria: **al recargar, la app se reinicia.** Es a propósito, para poder
recorrer el flujo desde cero muchas veces seguidas.

El catálogo, el pedido anterior, el avance en cocina y el pago están simulados. El detalle
completo de qué es real y qué no está en
[05 · Alcance y entregables](docs/05-alcance-y-entregables.md).

Etapa 2, cotizada aparte: investigación con usuarios reales, onboarding, perfil e
historial, promociones, panel del repartidor, pizzas por mitades y tema oscuro.

**Sobre las mitades:** la arquitectura ya está lista. Cada ingrediente carga un campo
`half` desde el día uno, y el motor de precios, el carrito y la ilustración ya saben
interpretar `left` y `right`. Habilitarlas es poner un flag en `true` y diseñar el
selector por lado — sin migración de datos ni refactor. El detalle está en
[04 · Sistema de diseño §6](docs/04-sistema-de-diseno.md).
