# Etapa 3 — Wireframes

Baja fidelidad, a propósito. Acá se resuelve **qué va en pantalla y en qué orden**, antes de
que color y tipografía entren a la discusión.

Referencia de viewport: 390 × 844 pt (iPhone 14 / Pixel 7 aprox.).
La **zona del pulgar** es el tercio inferior — todo lo accionable vive ahí.

---

## P1 — Inicio

```
┌─────────────────────────────────┐
│ Hola, Carlos 👋            [🛒2]│  Header. Badge de carrito
│ Enviar a: Av. Corrientes 1234 ▾ │  Dirección editable, una línea
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ TU ÚLTIMO PEDIDO            │ │  ◄── Sobre el pliegue.
│ │ Napolitana grande + Coca    │ │      Solo si hay historial.
│ │ Hace 12 días · $12.400      │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │   Repetir pedido        │ │ │  Botón primario, ancho completo
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Las más pedidas                 │
│ ┌───────┐ ┌───────┐ ┌───────┐  │  Scroll horizontal
│ │ img   │ │ img   │ │ img   │  │
│ │Muzza  │ │Napoli │ │Fugaz  │  │
│ │$8.900 │ │$9.800 │ │$9.400 │  │
│ └───────┘ └───────┘ └───────┘  │
├─────────────────────────────────┤
│ Todo el menú                    │
│ ┌─────────────────────────────┐ │
│ │ [img] Muzzarella            │ │  Lista vertical.
│ │       Salsa, muzza, aceituna│ │  Descripción a 2 líneas máx.
│ │       Desde $8.900      [+] │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [img] Napolitana        ... │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│   ⌂ Inicio          🛒 Carrito  │  Tab bar
└─────────────────────────────────┘
```

**Decisiones:**
- La dirección va en el header, no escondida en perfil: es lo primero que el usuario
  verifica y lo que más cambia (casa vs. oficina).
- "Las más pedidas" en scroll horizontal cumple doble función: atajo para el modo recompra
  y vitrina para el modo exploración.
- Precio "Desde $X" porque el precio real depende del tamaño. Evita la sensación de engaño
  al entrar al constructor.

---

## P2 — Constructor de pizza

La pantalla más importante de la app. **Un solo scroll, cuatro secciones numeradas,
total siempre visible.**

```
┌─────────────────────────────────┐
│ ←                               │  Back. Sin título: la imagen manda
│ ┌─────────────────────────────┐ │
│ │        [ imagen pizza ]     │ │  Hero. Se encoge al hacer scroll
│ └─────────────────────────────┘ │
│ Napolitana                      │
│ Salsa de tomate, muzzarella,    │
│ rodajas de tomate y albahaca    │
├─────────────────────────────────┤
│ 1 · Tamaño                      │
│ ┌────────┐┌────────┐┌────────┐ │  Selección única.
│ │Chica   ││Mediana ││Grande  │ │  Mediana viene preseleccionada
│ │6 porc. ││8 porc. ││12 porc.│ │
│ │$8.900  ││$11.400 ││$14.200 │ │  ◄── Precio en el punto de decisión
│ └────────┘└●───────┘└────────┘ │
├─────────────────────────────────┤
│ 2 · Masa                        │
│ ( ) Clásica              incl.  │  Clásica preseleccionada
│ ( ) A la piedra          +$800  │
│ ( ) Rellena de queso   +$2.200  │
├─────────────────────────────────┤
│ 3 · Ingredientes extra          │
│ Opcional                        │  ◄── "Opcional" explícito baja
│ [ ] Jamón              +$1.200  │      la carga percibida
│ [ ] Huevo              +$700    │
│ [ ] Aceitunas          +$500    │
│ [ ] Morrón             +$600    │
│ ...                             │
├─────────────────────────────────┤
│ 4 · Para acompañar              │
│ Opcional                        │
│ ┌───────┐ ┌───────┐ ┌───────┐  │  Scroll horizontal
│ │Coca   │ │Agua   │ │Fainá  │  │
│ │+$2.500│ │+$1.800│ │+$1.900│  │
│ └───────┘ └───────┘ └───────┘  │
│                                 │
│           (espacio)             │  Padding = altura de la barra fija
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Total      [–] 1 [+]        │ │  ◄── BARRA FIJA. Zona del pulgar.
│ │ $12.600                     │ │      El total se recalcula en vivo
│ │ ┌─────────────────────────┐ │ │
│ │ │   Agregar al carrito    │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Decisiones:**
- **Se puede agregar al carrito sin tocar nada.** Los defaults son los más pedidos.
- Las secciones 3 y 4 llevan la palabra "Opcional" visible. Es barata y baja mucho la
  ansiedad del usuario poco experimentado (supuesto S4).
- El selector de cantidad vive en la barra fija, no arriba: es la última decisión, no la primera.
- **Preparado para mitades:** la sección 3 está diseñada para admitir después un selector
  `Toda / Izquierda / Derecha` por ingrediente, sin mover nada más de la pantalla. Ver
  [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md#preparación-para-mitades).

---

## P3 — Carrito

```
┌─────────────────────────────────┐
│ ←   Tu pedido                   │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │[img] Napolitana grande      │ │
│ │      A la piedra            │ │  Configuración legible,
│ │      + Jamón, + Huevo       │ │  no un código
│ │      Editar                 │ │
│ │              [–] 1 [+]      │ │
│ │              $14.900        │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │[img] Coca-Cola 1.5L     ... │ │
│ └─────────────────────────────┘ │
│                                 │
│ + Agregar algo más              │
├─────────────────────────────────┤
│ Subtotal            $17.400     │  ◄── Desglose ANTES del botón
│ Envío                $1.500     │
│ ─────────────────────────────── │
│ Total               $18.900     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │      Continuar              │ │  Barra fija
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Estado vacío:** ilustración + "Tu carrito está vacío" + botón *Ver el menú*. Nunca una
pantalla en blanco.

---

## P4 — Checkout

```
┌─────────────────────────────────┐
│ ←   Confirmar pedido            │
├─────────────────────────────────┤
│ 1 · Entrega                     │
│ ┌────────────┐ ┌──────────────┐ │
│ │  Delivery  │ │    Retiro    │ │  Segmented control
│ │  ●         │ │              │ │
│ └────────────┘ └──────────────┘ │
│ Av. Corrientes 1234, Piso 3     │
│ Referencias (opcional)          │
│ ┌─────────────────────────────┐ │
│ │ Timbre roto, llamar         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 2 · Pago                        │
│ ( ) Efectivo                    │
│ ( ) Transferencia               │
│ ( ) Tarjeta                     │
├─────────────────────────────────┤
│ 3 · Resumen                     │
│ Subtotal            $17.400     │
│ Envío                $1.500     │
│ ─────────────────────────────── │
│ Total               $18.900     │
│ Llega en 35–45 min              │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │   Confirmar · $18.900       │ │  ◄── El monto va EN el botón
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Decisión:** el total va escrito dentro del botón de confirmación. Es el último punto donde
se puede eliminar la sorpresa de precio, y es gratis ponerlo ahí.

---

## P5 — Seguimiento del pedido

```
┌─────────────────────────────────┐
│     Pedido #1042                │
│                                 │
│         🍕 (ilustración)        │
│                                 │
│     Llega entre 20:35 y 20:45   │  Rango, no promesa exacta
├─────────────────────────────────┤
│  ●  Recibido            20:02   │  ✓ completado
│  │                              │
│  ●  En preparación      20:08   │  ✓ completado
│  │                              │
│  ◉  En el horno         20:15   │  ◄── ACTIVO: color + peso +
│  │                              │      indicador. Nunca solo color
│  ○  En camino                   │
│  │                              │
│  ○  Entregado                   │
├─────────────────────────────────┤
│ Napolitana grande · Coca 1.5L   │
│ Total: $18.900 · Efectivo       │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │   Volver al inicio          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Decisiones:**
- Rango horario en lugar de cuenta regresiva exacta: una cuenta regresiva que se atrasa
  genera más ansiedad que la que resuelve.
- Estado activo diferenciado por **tres** canales (color, peso tipográfico, forma del
  indicador) para cumplir accesibilidad.
- El resumen del pedido queda visible: responde "¿qué pedí?" sin navegar.
