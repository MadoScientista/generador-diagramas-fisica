# Reglas de UI — Generador MRU

> Las reglas de dominio físico (ecuaciones, validación, resolución, unidades, categorías de error) están en `.opencode/skills/physics/mru/SKILL.md`.

---

## 1. Elementos del diagrama

Todo diagrama MRU contiene:

- **Eje X principal**: línea horizontal (sin punta de flecha ni etiqueta "x")
- **Origen**: marcado con un tick vertical en el eje, etiquetado como $x = 0$
- **Móvil (cuadrado)**: representa la **posición inicial** $x_i$, sin ojo ni punto interior
- **Tick de $x_i$**: marca en el eje alineada con el móvil (solo cuando $x_i \neq 0$)
- **Tick de $x_f$**: marca en el eje para la posición final
- **Vector velocidad**: flecha desde el borde frontal del móvil, centrada verticalmente en la caja
- **Flecha de desplazamiento (Δx)**: eje secundario debajo del principal, desde $x_i$ hasta $x_f$
- **Etiquetas**: $x = 0$, $x_i$, $x_f$, $v$, $t$, $\Delta x$

---

## 2. Control de visualización de elementos

Cada elemento del diagrama tiene controles independientes en una tabla de 3 columnas, organizada dentro de un **card** con borde redondeado:

| Columna | Descripción |
|---------|-------------|
| **Etiqueta** | Muestra/oculta la etiqueta completa del elemento en el diagrama |
| **Valor** | Muestra el valor numérico con unidad dentro de la etiqueta (solo si Etiqueta está activo) |
| **Vector** | Muestra el vector/flecha del elemento (solo disponible para $v$ y $\Delta x$) |

La tabla de visualización:

| Elemento | Etiqueta | Valor | Vector |
|----------|----------|-------|--------|
| $x_i$ | `xi` / `xi = 20 m` | Activo/Inactivo | — |
| $x_f$ | `xf` / `xf = 50 m` | Activo/Inactivo | — |
| $v$ | `v` / `v = 3 m/s` | Activo/Inactivo | Activo/Inactivo |
| $t$ | `t` / `t = 10 s` | Activo/Inactivo | — |
| $\Delta x$ | `Δx` / `Δx = 30 m` | Activo/Inactivo | Activo/Inactivo |

- El checkbox **Valor** se deshabilita automáticamente si **Etiqueta** está destildado
- El checkbox **Vector** solo existe para $v$ (controla el vector velocidad) y $\Delta x$ (controla la flecha de desplazamiento)
- La visibilidad final del vector/flecha depende tanto del toggle Vector como de la condición física ($v \neq 0$ para vector, $\Delta x \neq 0$ para flecha)

---

## 3. Posiciones

### 3.1 El móvil representa $x_i$

El cuadrado blanco con borde negro representa la **posición inicial** $x_i$.

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

Para evitar que ticks de posiciones muy cercanas aparezcan superpuestos en pantalla, el layout engine impone una **distancia mínima de 50px** entre posiciones físicas distintas (origen, $x_i$, $x_f$).

- Se prueba primero un mapeo lineal; si todos los gaps entre adyacentes son ≥ 50px, se usa directamente
- Si algún gap es menor, se redistribuye: cada par adyacente recibe al menos 50px, y el espacio restante se asigna proporcionalmente a sus diferencias físicas
- Posiciones idénticas en valor físico (ej. origen y $x_i = 0$) ocupan el mismo punto en pantalla

### 3.5 Diagrama base (sin inputs)

Cuando hay menos de 3 campos numéricos llenos, se renderiza solo:
- Eje X principal
- Origen con etiqueta $x = 0$
- Caja centrada en el origen, sin orientación (mirada neutra)

---

## 4. Vector velocidad

- El vector se ancla al **borde frontal** del móvil (en la dirección del movimiento)
- $v > 0$: flecha desde el **borde derecho** del cuadrado hacia la derecha
- $v < 0$: flecha desde el **borde izquierdo** del cuadrado hacia la izquierda
- $v = 0$: no se dibuja vector
- La línea termina en la **base del triángulo**, no en la punta (la punta es el único extremo visible del triángulo)
- Su longitud es fija (80px, no escala con la magnitud de v)

---

## 5. Flecha de desplazamiento (eje secundario)

Debajo del eje principal hay un segundo eje horizontal:

- **Desde** $x_i$ **hasta** $x_f$
- Dirección de la punta = signo del desplazamiento (→ si $v > 0$, ← si $v < 0$)
- Es una línea continua con punta de flecha (sin dashed)
- La línea termina en la base del triángulo (misma lógica que el vector velocidad)

---

## 6. Etiquetas

### 6.1 Posiciones de las etiquetas

> El formato (`{id} = {valor} {unidad}`) y estilo (Inter/Roboto, sin itálica) están en AGENTS.md > UI Conventions.

| Texto | Posición |
|-------|----------|
| $x = 0$ | Debajo del tick del origen. Es la única sin valor ni unidad |
| $x_i$ | **Sobre el cuadrado** cuando está cerca del origen (< 50px pantalla); debajo del tick en caso contrario. Se etiqueta como **xi** (no x₀) |
| $x_f$ | **Sobre el cuadrado** cuando está cerca del origen (< 50px), subiendo 18px extra si $x_i$ también está elevado; debajo del tick en caso contrario. Se etiqueta como **xf** |
| $v$ | Encima del vector velocidad, centrado. Si el texto es largo, se desplaza horizontalmente para mantener 10px de separación con el borde del cuadrado |
| $t$ | En el punto medio entre $x_i$ y $x_f$, arriba de $v$ |
| $\Delta x$ | En el punto medio entre $x_i$ y $x_f$, debajo de la flecha de desplazamiento |

### 6.2 Control de visibilidad

- **Etiqueta**: si está desactivado, el nodo completo se oculta del SVG
- **Valor**: si está activado, la etiqueta muestra `{id} = {valor} {unidad}`; si no, solo `{id}`. Solo disponible si Etiqueta está activo
- **Vector**: controla la visibilidad del vector velocidad ($v$) o la flecha de desplazamiento ($\Delta x$). La visibilidad final es AND entre el toggle y la condición física ($v \neq 0$ o $\Delta x \neq 0$)

El toggle **Valor** se deshabilita visualmente cuando **Etiqueta** está destildado para evitar estados inconsistentes.

> Precisión decimal (máx 3 decimales) está en AGENTS.md > Conventions.

---

## 7. Representación del móvil

- Forma: cuadrado de **50×50** unidades
- Fondo: blanco
- Borde: negro, grosor 2px
- Sin ojo ni punto interior
- Orientación (mirada): determinada por el signo de $v$
  - $v > 0$: mira hacia la derecha
  - $v < 0$: mira hacia la izquierda
  - $v = 0$ o diagrama base: mirada neutra (sin dirección)

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

La página del generador MRU (`MRUGeneratorPage`) se divide en dos secciones principales:

**Sección izquierda (formulario):** dos cards con borde redondeado (`border: 1px solid #ddd; border-radius: 6px; padding: 1.5rem`), separadas por un gap de `1rem`.

- **Card 1 - "Datos del diagrama"** (`DiagramDataCard`): 4 campos de entrada usando el componente reutilizable `InputWithUnit` (input + selector de unidad). Un botón **"Calcular"** se habilita cuando exactamente 3 campos están llenos.

- **Card 2 - "Elementos del diagrama"** (`DiagramControlsCard`): tabla de controles con filas por elemento usando el componente `ControlRow`. Columnas: *Etiqueta*, *Valor*, *Vector*. Los checkboxes tienen tamaño `1rem × 1rem`.

Debajo de ambos cards, un botón **"Generar Diagrama"** genera o regenera el diagrama. También se regenera automáticamente cuando el usuario cambia una unidad de medida o cualquier checkbox de visualización.

Un botón **"Borrar datos"** debajo del formulario resetea todos los inputs, unidades y controles a sus valores por defecto, y limpia el diagrama.

**Sección derecha (diagrama):** componente `DiagramContainer` que muestra header (título "Vista previa" + botón **"Exportar"**) y el SVG generado. Estados vacío/error con `height: 250px`.

### 9.2 Estilo visual

> Estilo de cards, layout de página, fuente, estados vacío/error y flujo de UI están en AGENTS.md > UI Conventions.

La sección izquierda usa CSS Grid (`grid-template-columns: 320px 1fr`).

Los controles de visualización fluyen así: `MRUGeneratorPage` → `useDiagramControls()` → `controls` → `useMRUDiagram(controls)` → `engine.generate({controls})` → `module.infer()` → `MRUDiagramModel.controls` → `scene-builder.ts` que combina condiciones físicas con los toggles del usuario.

---

## 10. Notas de implementación

La variable calculada se auto-rellena y se marca como **computada**. Si el usuario edita el campo auto-computado, pasa a ser considerado **ingresado manualmente**.

Al cambiar una unidad mientras los 4 campos están llenos, se limpia el campo correspondiente y el motor lo re-computa en la nueva unidad.
