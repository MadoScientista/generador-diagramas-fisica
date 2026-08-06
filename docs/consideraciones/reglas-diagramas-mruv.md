# Reglas de UI — Generador MRUV

> Las reglas de dominio físico (ecuaciones, validación, resolución, unidades, categorías de error) están en `.opencode/skills/physics/mruv-physics-domain/SKILL.md`.

---

## 1. Elementos del diagrama

Todo diagrama MRUV contiene:

- **Eje X principal**: línea horizontal (sin punta de flecha ni etiqueta "x")
- **Origen**: marcado con un tick vertical en el eje, etiquetado como $x = 0$
- **Móvil (cuadrado)**: representa la posición en el eje. Puede aparecer en $x_i$, $x_f$, o ambos. Sin ojo ni punto interior
- **Tick de $x_i$**: marca en el eje alineada con el móvil (solo cuando $x_i \neq 0$)
- **Tick de $x_f$**: marca en el eje para la posición final
- **Vector velocidad inicial ($v_i$)**: flecha desde el borde frontal del móvil en $x_i$, centrada verticalmente en la caja
- **Vector velocidad final ($v_f$)**: flecha centrada sobre el móvil en $x_f$, arriba de este
- **Vector aceleración ($a$)**: flecha centrada horizontalmente entre $x_i$ y $x_f$, debajo de la etiqueta $a$
- **Flecha de desplazamiento ($\Delta x$)**: eje secundario debajo del principal, desde $x_i$ hasta $x_f$
- **Etiquetas**: $x = 0$, $x_i$, $x_f$, $v_i$, $v_f$, $a$, $t$, $\Delta x$

---

## 2. Control de visualización de elementos

> La tarjeta MRUV usa interruptores `role="switch"` con columnas *Var / Etiqueta / Valor / Vector / Móvil* (diseño en `estilo-elemento-diagrama.md`). La tabla de 4 columnas de MRU v1/v2 no cambia.

Interruptores en la tabla dentro del card **"Elementos del diagrama"**:

| Var | Etiqueta | Valor | Vector | Móvil |
|----------|----------|-------|--------|-------|
| $x_i$ | Activo/Inactivo | Activo/Inactivo | — | **Activo/Inactivo** |
| $x_f$ | Activo/Inactivo | Activo/Inactivo | — | **Activo/Inactivo** |
| $v_i$ | Activo/Inactivo | Activo/Inactivo | Activo/Inactivo | — |
| $v_f$ | Activo/Inactivo | Activo/Inactivo | Activo/Inactivo | — |
| $a$ | Activo/Inactivo | Activo/Inactivo | Activo/Inactivo | — |
| $t$ | Activo/Inactivo | Activo/Inactivo | — | — |
| $\Delta x$ | Activo/Inactivo | Activo/Inactivo | Activo/Inactivo | — |

Reglas de visibilidad:

- **Etiqueta** controla si el nodo del elemento se dibuja; **Valor** añade `= {valor} {unidad}` a la etiqueta
- **Valor → Etiqueta**: activar **Valor** con la etiqueta apagada enciende la etiqueta automáticamente; apagar **Etiqueta** apaga **Valor**
- **Móvil $x_i$**: controla si se muestra el personaje en la posición inicial. Si está desactivado, no se dibuja el cuadrado/personaje en $x_i$
- **Móvil $x_f$**: controla si se muestra el personaje en la posición final. Si está activado, se dibuja un segundo cuadrado/personaje en $x_f$
- **Vector $v_i$**: controla el vector de velocidad inicial en $x_i$. La visibilidad final es AND entre el toggle y $v_i \neq 0$
- **Vector $v_f$**: controla el vector de velocidad final en $x_f$. La visibilidad final es AND entre el toggle, $v_f \neq 0$, y que el **móvil $x_f$ esté visible**
- **Vector $a$**: controla la representación de la aceleración. La visibilidad final es AND entre el toggle y $a \neq 0$
- **Vector $\Delta x$**: controla la flecha de desplazamiento. La visibilidad final es AND entre el toggle y $\Delta x \neq 0$

Estados de fila en la tabla:

- **Magnitud físicamente cero** ($v_i = 0$, $v_f = 0$, $a = 0$, $\Delta x = 0$): los interruptores de la fila se deshabilitan con tooltip `"{id} = 0: este elemento no se dibuja"`
- **Fila $v_f$ dependiente**: si el móvil $x_f$ está desactivado, los interruptores de $v_f$ se deshabilitan con tooltip `"Activa el móvil de xf para mostrar vf"`
- **No aplica**: la celda de la columna que el elemento no tiene (Vector en $x_i/x_f/t$, Móvil en $v_i/v_f/a/t/\Delta x$) muestra una raya "—" con `aria-hidden`
- El estado vacío (< 4 campos llenos) no presenta estados de cero: ningún interruptor se deshabilita por magnitud cero (sin `resolvedValues` no hay `physicalZeros`). La dependencia del móvil $x_f$ sí aplica siempre: la fila $v_f$ queda deshabilitada si el móvil de $x_f$ está desactivado, incluso sin datos

### 2.1 Dependencias del móvil $x_f$

Cuando el **Móvil $x_f$** está desactivado:

- El **vector $v_f$** se oculta automáticamente
- La **etiqueta $v_f$** se oculta automáticamente
- Los interruptores de $v_f$ (Etiqueta, Valor, Vector) se **deshabilitan** visualmente

Al reactivar el móvil $x_f$, el vector y la etiqueta $v_f$ reaparecen según el estado de sus toggles.

---

## 3. Posiciones

### 3.1 El móvil representa las posiciones

El cuadrado blanco con borde negro representa una posición en el eje. Puede aparecer en $x_i$, $x_f$, o ambos, controlado por la columna "Móvil" en la tabla de visibilidad.

### 3.2 Ticks en el eje

Existen hasta tres marcas (ticks) verticales sobre el eje:

| Tick | Propósito | Visible cuando... |
|------|-----------|-------------------|
| $x = 0$ | Origen | Siempre |
| $x_i$ | Posición inicial | Controlado por toggle de visibilidad |
| $x_f$ | Posición final | Controlado por toggle de visibilidad |

Notas:
- La parte superior de los ticks coincide con el eje x principal
- Si $x_i = 0$, el tick de $x_i$ coincide con el origen
- Si $x_f = x_i$ (desplazamiento nulo), el tick de $x_f$ coincide con $x_i$

### 3.3 Escalado del Layout

El origen NO está fijo en el centro. Se reubica según el rango de datos:

- $x_i > 0$ y $x_f > 0$ → origen a la **izquierda**
- $x_i < 0$ y $x_f < 0$ → origen a la **derecha**
- $x_i$ y $x_f$ tienen signos distintos → origen **entre ambos**. No necesariamente tiene que estar al centro entre ambos, se debe considerar la distancia según los valores de $x_i$ y $x_f$

Los ticks de posición se restringen a una banda de `USABLE_WIDTH - 2 * POSITION_PADDING` (con `POSITION_PADDING = 40px`) centrada dentro del eje, dejando aire visual en los extremos.

### 3.4 Gap mínimo entre posiciones

Para evitar que ticks de posiciones muy cercanas aparezcan superpuestos en pantalla, el layout engine impone una **distancia mínima dinámica** entre posiciones físicas distintas (origen, $x_i$, $x_f$), calculada en `computeMinGap()`:

- Caso base: `halfChar + VECTOR_LENGTH + halfChar` = **130px** (mitad del personaje 50px + vector de velocidad 80px + mitad del personaje)
- Si hay etiquetas de velocidad ($v_i$/$v_f$), el gap crece según la longitud estimada del texto de la etiqueta (`n.text.length * 4`) para que esta no se superponga con el vector

- Se prueba primero un mapeo lineal; si todos los gaps entre adyacentes son ≥ `minGap`, se usa directamente
- Si algún gap es menor, se redistribuye: cada par adyacente recibe al menos `minGap`, y el espacio restante se asigna proporcionalmente a sus diferencias físicas
- Posiciones idénticas en valor físico (ej. origen y $x_i = 0$) ocupan el mismo punto en pantalla

### 3.5 Diagrama base (sin inputs)

Cuando hay menos de 4 campos numéricos llenos, se renderiza solo:
- Eje X principal
- Origen con etiqueta $x = 0$
- Caja centrada en el origen, sin orientación (mirada neutra)

---

## 4. Vectores en el diagrama

### 4.1 Vectores de Velocidad ($v_i$ y $v_f$)

- **$v_i$**: anclado al **borde frontal** del móvil en $x_i$. $v_i > 0$ → flecha desde el borde derecho hacia la derecha. $v_i < 0$ → flecha desde el borde izquierdo hacia la izquierda. $v_i = 0$ → no se dibuja.
- **$v_f$**: anclado al **borde frontal** del móvil en $x_f$, a la altura del centro del móvil (misma lógica que $v_i$). $v_f > 0$ → flecha desde el borde derecho hacia la derecha. $v_f < 0$ → flecha desde el borde izquierdo hacia la izquierda. $v_f = 0$ o móvil $x_f$ oculto → no se dibuja.
- La línea termina en la **base del triángulo**, no en la punta.
- Longitud fija de 80px (no escala con la magnitud de $v$).

### 4.2 Vector Aceleración ($a$)

- **Ubicación**: centrado en el eje horizontal principal (viewport `VIEWPORT_WIDTH / 2`), debajo de la etiqueta $a$ y sobre el eje principal. Ya no se posiciona en el punto medio entre $x_i$ y $x_f$ — esto evita que se agrupe con los móviles cuando $x_i$ y $x_f$ están cerca.
- **Sentido**:
  - $a > 0$: flecha apuntando a la derecha
  - $a < 0$: flecha apuntando a la izquierda
  - $a = 0$: no se dibuja
- La línea termina en la base del triángulo (misma lógica que los vectores velocidad).

---

## 5. Representación del móvil

- Forma: cuadrado de **50×50** unidades
- Fondo: blanco, borde negro, grosor 2px
- Sin ojo ni punto interior
- Puede haber hasta **2 móviles** visibles simultáneamente (uno en $x_i$ y otro en $x_f$)
- Orientación (mirada): cada móvil mira en la dirección de su vector de velocidad correspondiente
  - Móvil en $x_i$: mira según el signo de $v_i$
    - $v_i > 0$: mira hacia la derecha
    - $v_i < 0$: mira hacia la izquierda
    - $v_i = 0$: mira hacia la derecha (se trata como positiva; no existe mirada neutra con datos)
  - Móvil en $x_f$: mira según el signo de $v_f$
    - $v_f > 0$: mira hacia la derecha
    - $v_f < 0$: mira hacia la izquierda
    - $v_f = 0$: mira hacia la derecha
  - Diagrama base (sin datos): mirada neutra (sin dirección)
  - Nota: a nivel de renderizado `right` y `none` son indistinguibles (solo la orientación `left` invierte el sprite); la distinción es semántica.
- Tipo de personaje configurable: cuadrado, persona, bicicleta, automóvil (mismo patrón que MRU v2)

---

## 6. Etiquetas

### 6.1 Posiciones de las etiquetas

> El formato (`{id} = {valor} {unidad}`), estilo (Inter/Roboto, sin itálica) y precisión decimal (máx 3 decimales) están en AGENTS.md > UI Conventions / Conventions.

| Texto | Posición |
|-------|----------|
| $x = 0$ | Debajo del tick del origen. Es la única sin valor ni unidad |
| $x_i$ | **Sobre el cuadrado** cuando está cerca del origen (< 50px pantalla); debajo del tick en caso contrario. Se etiqueta como **xi** (no x₀) |
| $x_f$ | **Sobre el cuadrado** cuando está cerca del origen (< 50px), subiendo 18px extra si $x_i$ también está elevado; debajo del tick en caso contrario. Se etiqueta como **xf** |
| $v_i$ | Encima del vector velocidad inicial, centrado |
| $v_f$ | Encima del vector $v_f$, centrada (misma lógica que la etiqueta $v_i$) |
| $t$ | Centrado en el eje horizontal principal (`VIEWPORT_WIDTH / 2`), **sobre** la etiqueta $a$ |
| $a$ | Centrado en el eje horizontal principal (`VIEWPORT_WIDTH / 2`), **debajo** de $t$ y **sobre** el vector aceleración |
| $\Delta x$ | En el punto medio entre $x_i$ y $x_f$, debajo de la flecha de desplazamiento |

La pila vertical sobre el eje (de arriba hacia abajo) es: $t$ → $a$ → vector $a$ → eje. El offset vertical de $t$ es `AXIS_Y - charH - LABEL_GAP - 78` y el de $a$ es `AXIS_Y - charH - LABEL_GAP - 48`, con una separación de 30px entre ambos. El vector aceleración se ubica en `AXIS_Y - charH - 41`.

Los vectores de velocidad $v_i$ y $v_f$ se posicionan a la altura del centro del móvil (`AXIS_Y - charH / 2`); $v_f$ usa la misma lógica de anclaje que $v_i$ (borde frontal del móvil en $x_f$). La etiqueta $v_f$ se posiciona igual que la de $v_i$: desplazada según la dirección del vector y 14px por encima de su línea.

### 6.2 Control de visibilidad

- **Etiqueta**: si está desactivado, el nodo completo se oculta del SVG
- **Valor**: si está activado, la etiqueta muestra `{id} = {valor} {unidad}`; si no, solo `{id}`. Activar **Valor** enciende **Etiqueta** automáticamente
- **Vector**: controla la visibilidad de $v_i$, $v_f$, $a$ o $\Delta x$. La visibilidad final es AND entre el toggle y la condición física ($v_i \neq 0$, $v_f \neq 0$, $a \neq 0$ o $\Delta x \neq 0$)
- **Etiqueta $v_f$**: desaparece si el vector $v_f$ no es visible (por toggle desactivado, $v_f = 0$, o móvil $x_f$ oculto)

---

## 7. Flecha de desplazamiento (eje secundario)

Debajo del eje principal hay un segundo eje horizontal:

- **Desde** $x_i$ **hasta** $x_f$
- Dirección de la punta = signo del desplazamiento (→ si $\Delta x > 0$, ← si $\Delta x < 0$)
- Es una línea continua con punta de flecha (sin dashed)
- La línea termina en la base del triángulo (misma lógica que los vectores velocidad)

---

## 8. Casos especiales de renderizado

### 8.1 $x_i$ o $x_f$ cerca del origen

Cuando $x_i$ o $x_f$ están a menos de 50px en pantalla del origen:

- El elemento respectivo ($x_i$ o $x_f$) coloca su etiqueta **sobre el cuadrado** (misma altura que $t$), en vez de debajo del tick
- Si $x_i$ está en el origen exacto:
  - Móvil centrado sobre el tick del origen
  - Tick de $x_i$ = tick del origen (no hay tick separado)
- Si **ambos** $x_i$ y $x_f$ están elevados, $x_f$ se desplaza 18px más arriba que $x_i$ para evitar superposición

### 8.2 Cruce del origen ($x_i < 0 < x_f$ o $x_f < 0 < x_i$)

- El origen debe permanecer visible entre ambos ticks
- Tres ticks visibles: $x_i$, $x = 0$, $x_f$

---

## 9. Layout de la página

### 9.1 Estructura

La página del generador MRUV sigue la misma estructura de MRU v2:

**Sección izquierda (formulario):** cards con formulario usando CSS Grid (`grid-template-columns: 320px 1fr`).

Las tres tarjetas usan un patrón de **acordeón controlado**: solo una puede estar abierta a la vez. El estado se maneja con `useState<'datos' | 'elementos' | 'apariencia' | null>('datos')` en el padre. Cada `CollapsibleCard` recibe `open` y `onToggle` como props controladas; al hacer clic en el encabezado se cierra si ya estaba abierta, o se abre y cierra la anterior.

- **Card 1 - "Datos del diagrama"** (`DiagramDataCardMRUV`): envuelta en `CollapsibleCard` controlada con `open={openCard === 'datos'}`. Contiene 4 campos de entrada visibles usando el componente reutilizable `InputWithUnit` ($x_i$, $v_i$, $a$, $t$). Los campos $x_f$ y $v_f$ están ocultos pero la lógica subyacente se mantiene para posible re-habilitación futura. No hay botón "Calcular" — el motor resuelve automáticamente al contar con datos en los 4 campos. Incluye botón "Borrar datos" al final.
  - `InputWithUnit` usa `UnitSelect` (dropdown personalizado) para la selección de unidades, en vez de un `<select>` nativo.
  - Los placeholders de los campos muestran subíndices con HTML `<sub>` mediante `identToHTML`: `xi` → `x<sub>i</sub>`, `xf` → `x<sub>f</sub>`, `vi` → `v<sub>i</sub>`, `vf` → `v<sub>f</sub>`.
  - Las unidades en el dropdown se renderizan con HTML `<sup>` mediante `displayUnitHTML`: `m/s^2` → `m/s<sup>2</sup>`.
  - El dropdown y el input comparten `font-size: 1rem`, `line-height: normal` y `padding` idéntico para igualar alturas.
- **Card 2 - "Elementos del diagrama"** (`DiagramControlsCardMRUV`): envuelta en `CollapsibleCard` controlada con `open={openCard === 'elementos'}`. Tabla de controles con 7 filas agrupadas por física ($x_i$, $x_f$ en **Posición**; $v_i$, $v_f$ en **Velocidad**; $a$ en **Aceleración**; $t$ en **Tiempo**; $\Delta x$ en **Desplazamiento**). Columnas: *Var*, *Etiqueta*, *Valor*, *Vector*, *Móvil*. Interruptores `role="switch"` (clase `.toggle-switch`) con `aria-label` ("Mostrar etiqueta de xi", etc.). Columnas no aplicables muestran raya "—" (`aria-hidden`). **Valor auto-activa Etiqueta** al encenderse; apagar Etiqueta apaga Valor. Los interruptores de una fila se deshabilitan si la magnitud física es 0 ($v_i$, $v_f$, $a$, $\Delta x$; `physicalZeros` calculado desde `resolvedValues`) con tooltip `"{id} = 0: este elemento no se dibuja"`, o si es la fila $v_f$ con el móvil de $x_f$ desactivado (tooltip `"Activa el móvil de xf para mostrar vf"`). Hover en fila + separadores de grupo reemplazan el modo cebra.
- **Card 3 - "Apariencia del diagrama"** (`DiagramAppearanceCard`): envuelta en `CollapsibleCard` controlada con `open={openCard === 'apariencia'}`. Selector "Movil" (cuadrado, persona, bicicleta, automóvil) y selector "Suelo" (Línea, Pasto, Calle, Playa). El valor de "Suelo" se propaga al motor y es funcional: con la opción "Línea" el móvil toca el eje tal como siempre; con "Pasto", "Calle" o "Playa" el eje principal baja 10 px y en el espacio entre el móvil y el eje se dibuja la banda del suelo seleccionado (verde con briznas, asfalto con línea discontinua, arena con textura respectivamente). Las marcas del eje y las etiquetas/desplazamiento inferiores se desplazan junto con el eje; el móvil y las etiquetas superiores conservan su posición.

No hay botón "Generar Diagrama" global — el motor se ejecuta automáticamente cuando los datos son suficientes.

**Sección derecha (diagrama):** componente `DiagramSection` que contiene:

- **Header fijo (`.card-header`)**: padding `1rem 1rem 0.5rem`, display flex con gap `0.75rem`. Pill de navegación (Diagrama / Gráficos) alineado a la izquierda + botón "Exportar" alineado a la derecha. El botón Exportar usa estilo secundario (`background: transparent`, `border: 1px solid #d4d4d4`, `color: #333`) para no competir con el azul de la navegación principal.
- **Cuerpo (`.card-body`)**: contenido variable según la pestaña activa:
  - **Diagrama**: barra de sub-tabs con etiqueta "Vista previa" (no interactiva, `cursor: default`), seguida del SVG renderizado dentro de `.diagram-section-svg` (altura mínima 440px). Estados vacío/error con placeholder centrado.
  - **Gráficos**: barra de sub-tabs interactivos (Posición / Velocidad / Aceleración) alineados a la izquierda con línea horizontal completa bajo ellos. Cada tab usa `role="tab"` con navegación por teclado (ArrowLeft/ArrowRight). El SVG del gráfico se renderiza debajo en `.graph-panel-body` / `.graph-svg-container`.
- **Pill (`.view-switcher-inner`)**: fondo `#f4f3ef`, borde `#e5e3da`, border-radius 999px, padding 3px. Tab activo: fondo blanco + sombra, texto `#1a1a18`. Tab inactivo: texto `#6b6a63`.
- **Sub-tabs**: `border-bottom: 1px solid #e5e3da` a lo ancho de la tarjeta. Tabs con `padding: 0.5rem 1.25rem`, texto `#a3a199` (inactivo) / `#1a1a18` con `border-bottom: 2px solid #6b6a63` (activo).
- **Estados vacío/error**: placeholder con `height: 474px`, texto en itálica, color `#888`.
- **Estiramiento vertical**: la sección derecha usa la clase `diagram-section--stretch` (solo en la página MRUV). La tarjeta del diagrama (`.diagram-section-card`) hace `flex: 1` y el `.diagram-section-body` también crece, de modo que el **borde inferior de la tarjeta calza con el borde inferior de la tarjeta "Apariencia del diagrama"** de la columna izquierda, sin importar qué tarjetas del acordeón estén abiertas.

### 9.2 Estilos

> Estilo de cards, layout de página, fuente, estados vacío/error y flujo de UI están en AGENTS.md > UI Conventions.

| Tarjeta | Estado inicial | Componente interno |
|---------|---------------|-------------------|
| "Datos del diagrama" | Abierta (valor inicial de `openCard`: `'datos'`) | `DiagramDataCardMRUV` con `showTitle={false}` |
| "Elementos del diagrama" | Cerrada | `DiagramControlsCardMRUV` con `showTitle={false}` |
| "Apariencia del diagrama" | Cerrada | `DiagramAppearanceCard` |

### 9.3 Comportamiento de acordeón

Las tres tarjetas colapsables funcionan como un grupo de acordeón con transiciones sincronizadas:

- Solo una tarjeta puede estar abierta simultáneamente
- Al hacer clic en el encabezado de una tarjeta cerrada mientras otra está abierta, la transición de cierre y apertura ocurren **simultáneamente**: ambas tarjetas cambian de estado en el mismo render de React
- Al hacer clic en el encabezado de la tarjeta actualmente abierta, se cierra (todas colapsan)
- El estado se maneja con `useState<'datos' | 'elementos' | 'apariencia' | null>('datos')`
- El callback `handleToggleCard(card)` decide: si la tarjeta clickeada es la misma que la abierta, devuelve `null`; si es otra, devuelve esa
- La sincronización visual se logra midiendo la altura exacta del contenido via `scrollHeight` (más padding del estado abierto), de modo que ambas transiciones `max-height` recorran el mismo rango y terminen al mismo tiempo

### 9.4 Animación de despliegue

El colapso y expansión de las tarjetas usa transiciones CSS para una animación suave:

- El `max-height` se controla dinámicamente via inline style, midiendo la altura exacta del contenido con `scrollHeight` más el padding del estado abierto (`2.25rem`). Esto asegura que ambas transiciones (apertura y cierre) recorran el mismo rango y terminen sincronizadas
- Duración de transiciones (20% más rápidas que el valor original):
  - `max-height`: 0.28s
  - `opacity`: 0.2s
  - `padding`: 0.24s
- El padding vertical transiciona de `0` a `0.75rem 1.5rem 1.5rem`
- El chevron del encabezado rota 180° con transición de 0.2s

---

## 10. Estrategia de renderizado de subíndices y superíndices

Todos los subíndices y superíndices se renderizan usando una **estrategia unificada basada en segmentos de texto**, adaptada al contexto de salida:

| Contexto | Estrategia | Archivo clave |
|----------|-----------|---------------|
| Labels del diagrama (SVG) | `TextSegment[]` → `<tspan>` con `dy` (offset vertical) y `fontSize` reducido. Subíndice: `dy=4`, `fontSize=10`. Superíndice: `dy=-4`, `fontSize=10`. | `renderer.ts:renderSegments`, `format.ts:parseIdentifier`, `format.ts:parseUnit` |
| Ejes de gráficos (SVG) | Misma estrategia de `<tspan>` que los labels del diagrama. `renderGraph` recibe `yLabelDesc` y `yUnit` por separado; la unidad se pasa por `parseUnit` y se renderiza con `renderSegments`. | `shared.ts`, `format.ts:parseUnit` |
| Placeholders de inputs (HTML) | `identToHTML` convierte identificadores (`xi`, `xf`, `vi`, `vf`) a HTML con `<sub>`. Se renderiza como overlay posicionado sobre el input con `pointer-events: none`. | `format.ts:identToHTML`, `InputWithUnit.tsx` |
| Dropdown de unidades (HTML) | `displayUnitHTML` convierte `^2` → `<sup>2</sup>`. El `UnitSelect` usa `<button>` con `dangerouslySetInnerHTML`. `<sup>` usa `vertical-align: super` + `line-height: 0` para evitar expandir la caja del botón. | `units.ts:displayUnitHTML`, `UnitSelect.tsx` |

Los `<sub>` y `<sup>` deben usarse siempre en **contexto inline** (no dentro de `display: flex`), porque `vertical-align` no se aplica a flex items.

### 10.1 Representación interna vs visual

Internamente, las unidades se almacenan con notación `^` (ej. `m/s^2`, `km/h^2`). La conversión a visual ocurre en la capa de presentación:

- SVG: `parseUnit` → `<tspan dy="-4" font-size="10">2</tspan>`
- HTML: `displayUnitHTML` → `<sup>2</sup>`
- Texto plano: `displayUnit` → Unicode `²` (solo para contextos que no admiten HTML, como opciones nativas)

## 11. Notas de implementación

La variable calculada se auto-rellena y se marca como **computada**. Si el usuario edita el campo auto-computado, pasa a ser considerado **ingresado manualmente**.

Al cambiar una unidad mientras los campos están llenos, se limpia el campo correspondiente y el motor lo re-computa en la nueva unidad. Para forzar una re-evaluación manual, el usuario puede presionar **Enter** en cualquier campo o borrar y re-ingresar un valor.

### 11.1 Campos ocultos

Los campos $x_f$ y $v_f$ están ocultos del formulario pero toda la lógica subyacente se mantiene:

- Los estados de formulario para $x_f$ y $v_f$ siguen existiendo
- El motor de física resuelve $x_f$ y $v_f$ a partir de $x_i$, $v_i$, $a$, $t$
- Los controles de visibilidad para $x_f$ y $v_f$ siguen funcionando
- Para re-habilitar estos campos, solo es necesario descomentar los `InputWithUnit` correspondientes en `DiagramDataCardMRUV.tsx`
