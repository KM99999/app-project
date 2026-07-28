# Etapa 6 — Handoff a desarrollo

La checklist que mencioné en la conversación, más las notas de implementación.

---

## Checklist de diseño móvil

La que uso antes de dar un diseño por entregado. Todo lo marcado está verificado en este
proyecto.

### Estructura

- [x] Toda acción primaria dentro de la zona del pulgar (tercio inferior)
- [x] Área táctil mínima de 48×48 en todo lo accionable
- [x] Área segura respetada arriba y abajo (notch y gesto de inicio)
- [x] Espacio reservado al final de cada lista que convive con una barra fija
- [x] Scroll horizontal solo donde es opcional descubrir más (nunca en el camino crítico)
- [x] Sin scroll anidado dentro de modales

### Estados

- [x] Cada control con sus estados: normal, presionado, seleccionado, deshabilitado
- [x] Estados vacíos con explicación y salida (carrito)
- [x] Estado "sin historial" resuelto sin dejar un hueco en la pantalla
- [x] Feedback de presión visible (en móvil no hay hover)
- [ ] Estados de carga y error de red — no aplican: el prototipo no tiene backend

### Color y tipografía

- [x] Todo el color sale de tokens; ningún `#hex` suelto en componentes
- [x] Contraste AA verificado y documentado color por color
- [x] Ningún estado comunicado solo por color (mínimo dos canales, tres en el seguimiento)
- [x] Escala tipográfica cerrada; ningún tamaño fuera de la escala
- [x] Fuente del sistema, para respetar el tamaño de texto configurado por el usuario

### Contenido

- [x] Precios visibles en el punto de decisión, no solo en el total
- [x] Desglose completo antes del botón de confirmar
- [x] Secciones opcionales marcadas como opcionales
- [x] Configuración del producto en palabras, no en códigos
- [x] Rango horario en lugar de cuenta regresiva
- [x] Etiquetas de campo persistentes, no placeholders que se borran

### Accesibilidad

- [x] `accessibilityRole` en todo control interactivo
- [x] `accessibilityState` para checked, disabled y busy
- [x] Etiquetas con contexto ("Napolitana, desde $8.900")
- [x] Ilustraciones con rol y etiqueta
- [ ] Prueba con lector de pantalla real (VoiceOver / TalkBack) — recomendada para la etapa 2

### Implementación

- [x] Tokens en un archivo único y traducible
- [x] Componentes reutilizables con sus variantes
- [x] Convenciones Material 3 e iOS HIG respetadas
- [x] Sin dependencia de assets remotos
- [x] Typecheck en verde
- [x] Build web verificada, y las cinco pantallas recorridas en navegador sin errores de consola

---

## Notas de implementación

### Dónde tocar cada cosa

| Para cambiar… | Editar |
|---|---|
| Colores, tipografía, espaciado | [`src/design-system/tokens.ts`](../src/design-system/tokens.ts) |
| Menú, precios, envío | [`src/domain/menu.ts`](../src/domain/menu.ts) |
| Cómo se calcula un precio | [`src/domain/pricing.ts`](../src/domain/pricing.ts) |
| Carrito, pedidos, estado | [`src/store/order-store.tsx`](../src/store/order-store.tsx) |
| Un componente compartido | [`src/design-system/`](../src/design-system/) |
| Una pantalla | [`src/app/`](../src/app/) |

### Reglas que conviene no romper

1. **El precio se calcula en un solo lugar.** `pricing.ts` lo usan el Constructor, el
   carrito, el checkout y el seguimiento. Si aparece un segundo cálculo en algún lado,
   vuelve la sorpresa de precio al final.
2. **Ningún componente declara un valor crudo.** Sin `#hex`, sin `padding: 13`. Si falta
   un valor, se agrega a `tokens.ts` primero.
3. **Ninguna pantalla usa `<Text>` de React Native directamente.** Se usa el `Text` del
   sistema de diseño, que es lo que mantiene la escala consistente.
4. **`half` no se saca del modelo.** Es lo que deja las mitades a un flag de distancia.

### Cuando conecten el backend

Reemplazar el contenido de `menu.ts` por llamadas a la API. La forma de los objetos es la
misma, así que las pantallas no cambian. El orden sugerido:

1. Catálogo y precios (`menu.ts` → API)
2. Autenticación y perfil (reemplaza `USER_NAME` y `DEFAULT_ADDRESS`)
3. Envío del pedido (`placeOrder` → POST)
4. Estado del pedido (los `setTimeout` simulados → websocket o push)
5. Persistencia del carrito (memoria → almacenamiento local)

### Si migran a Flutter

`tokens.ts` es lo único que hay que traducir; todo lo demás se deriva de ahí. Los
componentes tienen equivalente directo: `OptionRow` → `RadioListTile` / `CheckboxListTile`,
`ChoiceCard` → `ChoiceChip` con contenido propio, `StickyBar` → `bottomNavigationBar`,
`Segmented` → `SegmentedButton`. La `PizzaArt` se rehace con `CustomPainter` siguiendo la
misma distribución por ángulo áureo.

---

## Riesgos conocidos

Honestidad sobre lo que puede fallar en producción.

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El supuesto S4 resulta falso y el scroll único abruma a usuarios poco digitales | Alto — es la decisión central del Constructor | Plan B ya pensado: scroll único con anclas de navegación por sección. No se vuelve al wizard |
| Un menú mucho más grande que el de muestra vuelve pesada la home | Medio | Categorías y buscador, etapa 2 |
| Muchos ingredientes seleccionados saturan la ilustración | Bajo | Techo de marcas por pizza en `PizzaArt` |
| El umbral de envío gratis no funciona económicamente | Medio | Es un solo número en `menu.ts` (`FREE_DELIVERY_FROM`) |
