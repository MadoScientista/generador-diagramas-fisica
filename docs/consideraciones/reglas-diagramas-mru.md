# Reglas de diagramas MRU

Basado en los diagramas de referencia en `docs/diagramas-referencia/`.

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

### 1.1 Inputs del usuario

| Input | Descripción | Unidad por defecto |
|-------|-------------|--------------------|
| $x_i$ | Posición inicial | m |
| $v$ | Velocidad | m/s |
| $t$ | Tiempo | s |
| $x_f$ | Posición final (opcional para cálculo, siempre visible en UI) | m |
| Unidad de $x_i$ | Selector: m o km (independiente de $x_f$) | m |
| Unidad de $x_f$ | Selector: m o km (independiente de $x_i$) | m |
| Unidad de tiempo | Selector: s, min, h | s |
| Unidad de velocidad | Selector: m/s o km/h | m/s |

### 1.2 Control de visualización de elementos

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

## 2. Posiciones

### 2.1 El móvil representa $x_i$

El cuadrado blanco con borde negro representa la **posición inicial** $x_i$.

### 2.2 Ticks en el eje

Existen hasta tres marcas (ticks) verticales sobre el eje:

| Tick | Propósito | Visible cuando... |
|------|-----------|-------------------|
| $x = 0$ | Origen | Siempre |
| $x_i$ | Posición inicial | $x_i \neq 0$ |
| $x_f$ | Posición final | Siempre (aunque coincida con $x_i$) |

Notas:
- La parte superior de los ticks coincide con el eje x principal
- Si $x_i = 0$, el tick de $x_i$ coincide con el origen
- Si $x_f = x_i$ (v = 0, t = 0, o desplazamiento nulo), el tick de $x_f$ coincide con $x_i$

### 2.3 Escalado del Layout

El origen NO está fijo en el centro. Se reubica según el rango de datos:

- $x_i > 0$ y $x_f > 0$ → origen a la **izquierda**
- $x_i < 0$ y $x_f < 0$ → origen a la **derecha**
- $x_i$ y $x_f$ tienen signos distintos → origen **entre ambos**. No necesariamente tiene que estar al centro entre ambos, se debe considerar la distancia según los valores de $x_i$ y $x_f$

Los valores físicos se convierten internamente a SI en la construcción de escena, por lo que la proporcionalidad es correcta incluso cuando $x_i$ y $x_f$ tienen unidades de distancia diferentes (ej. $x_i$ en m, $x_f$ en km).

Los ticks de posición se restringen a una banda de `USABLE_WIDTH - 2 * POSITION_PADDING` (con `POSITION_PADDING = 40px`) centrada dentro del eje, dejando aire visual en los extremos.

### 2.4 Gap mínimo entre posiciones

Para evitar que ticks de posiciones muy cercanas (ej. $x_i = 0.001$, $x_f = 5$) aparezcan superpuestos en pantalla, el layout engine impone una **distancia mínima de 50px** entre posiciones físicas distintas (origen, $x_i$, $x_f$).

- Se prueba primero un mapeo lineal; si todos los gaps entre adyacentes son ≥ 50px, se usa directamente
- Si algún gap es menor, se redistribuye: cada par adyacente recibe al menos 50px, y el espacio restante se asigna proporcionalmente a sus diferencias físicas
- Posiciones idénticas en valor físico (ej. origen y $x_i = 0$) ocupan el mismo punto en pantalla

### 2.5 Diagrama base (sin inputs)

Cuando hay menos de 3 campos numéricos llenos, se renderiza solo:
- Eje X principal
- Origen con etiqueta $x = 0$
- Caja centrada en el origen, sin orientación (mirada neutra)

---

## 3. Vector velocidad

- El vector se ancla al **borde frontal** del móvil (en la dirección del movimiento)
- $v > 0$: flecha desde el **borde derecho** del cuadrado hacia la derecha
- $v < 0$: flecha desde el **borde izquierdo** del cuadrado hacia la izquierda
- $v = 0$: no se dibuja vector
- La línea termina en la **base del triángulo**, no en la punta (la punta es el único extremo visible del triángulo)
- Su longitud es fija (80px, no escala con la magnitud de v)

---

## 4. Flecha de desplazamiento (eje secundario)

Debajo del eje principal hay un segundo eje horizontal:

- **Desde** $x_i$ **hasta** $x_f$
- Dirección de la punta = signo del desplazamiento (→ si $v > 0$, ← si $v < 0$)
- Es una línea continua con punta de flecha (sin dashed)
- La línea termina en la base del triángulo (misma lógica que el vector velocidad)
- Representa visualmente el desplazamiento neto $\Delta x = x_f - x_i$

---

## 5. Etiquetas

### 5.1 Formato

Todas las etiquetas excepto $x = 0$ llevan el formato:

```
{identificador} = {valor} {unidad}
```

Donde `{unidad}` depende de los selects de unidad elegidos por el usuario.

| Texto | Ejemplo (SI) | Posición |
|-------|-------------|----------|
| $x = 0$ | `x = 0` | Debajo del tick del origen |
| $x_i$ | `xi = 20 m` | **Sobre el cuadrado** cuando $x_i$ está cerca del origen (distancia en pantalla < 50px); debajo del tick en caso contrario |
| $x_f$ | `xf = 50 m` | **Sobre el cuadrado** cuando $x_f$ está cerca del origen (distancia en pantalla < 50px), subiendo 18px extra si $x_i$ también está elevado; debajo del tick en caso contrario |
| $v$ | `v = 3 m/s` | Encima del vector velocidad, centrado. Si el texto es largo, se desplaza horizontalmente para mantener 10px de separación con el borde del cuadrado |
| $t$ | `t = 10 s` | En el punto medio entre $x_i$ y $x_f$, arriba de $v$ |
| $\Delta x$ | `Δx = 30 m` | En el punto medio entre $x_i$ y $x_f$, debajo de la flecha de desplazamiento |

### 5.2 Estilo

- Las etiquetas usan **Inter** (Roboto como fallback), sans-serif, sin itálica
- La posición inicial se etiqueta como **xi**, no como x₀
- La posición final se etiqueta como **xf**
- $x = 0$ es la única etiqueta que no lleva valor ni unidad

### 5.3 Control de visibilidad

Cada elemento tiene 3 controles en la UI, organizados en una tabla:

- **Etiqueta**: si está desactivado, el nodo completo se oculta del SVG
- **Valor**: si está activado, la etiqueta muestra `{id} = {valor} {unidad}`; si no, solo `{id}`. Solo disponible si Etiqueta está activo
- **Vector**: controla la visibilidad del vector velocidad ($v$) o la flecha de desplazamiento ($\Delta x$). La visibilidad final es AND entre el toggle y la condición física ($v \neq 0$ o $\Delta x \neq 0$)

El toggle **Valor** se deshabilita visualmente cuando **Etiqueta** está destildado para evitar estados inconsistentes.

### 5.4 Formato decimal

Todos los valores numéricos en las etiquetas se formatean con:

- Precisión de 3 decimales en cálculos internos
- Si el valor redondeado no tiene parte decimal (ej. `5.000`), se muestra como entero: `5`
- Si tiene decimales significativos, se muestran hasta 3: `5.123`, `0.5`, `3.1`

Notas sobre unidades:
- $x_i$ usa su propio selector de unidad (`x0Unit`)
- $x_f$ usa su propio selector de unidad (`xfUnit`)
- $\Delta x$ usa la unidad de $x_i$ (`x0Unit`)

---

## 6. Representación del móvil

- Forma: cuadrado de **50×50** unidades
- Fondo: blanco
- Borde: negro, grosor 2px
- Sin ojo ni punto interior
- Orientación (mirada): determinada por el signo de $v$
  - $v > 0$: mira hacia la derecha
  - $v < 0$: mira hacia la izquierda
  - $v = 0$ o diagrama base: mirada neutra (sin dirección)

---

## 7. Casos especiales

### 7.1 $v = 0$ (reposo)

- Sin vector velocidad
- Sin etiqueta $v$
- Sin flecha de desplazamiento
- Sin etiqueta $\Delta x$
- $x_f = x_i$ (ambos ticks coinciden)
- Un solo tick visible para $x_i = x_f$ (además del origen si $x_i \neq 0$)

### 7.2 $x_i$ o $x_f$ cerca del origen

Cuando $x_i$ o $x_f$ están a menos de 50px en pantalla del origen:

- El elemento respectivo ($x_i$ o $x_f$) coloca su etiqueta **sobre el cuadrado** (misma altura que $t$), en vez de debajo del tick
- Si $x_i$ está en el origen exacto:
  - Móvil centrado sobre el tick del origen
  - Tick de $x_i$ = tick del origen (no hay tick separado)
- Si **ambos** $x_i$ y $x_f$ están elevados, $x_f$ se desplaza 18px más arriba que $x_i$ para evitar superposición

### 7.3 Cruce del origen ($x_i < 0 < x_f$ o $x_f < 0 < x_i$)

- El origen debe permanecer visible entre ambos ticks
- Tres ticks visibles: $x_i$, $x = 0$, $x_f$

### 7.4 $t = 0$

- $x_f = x_i$ (no hay desplazamiento)
- Mismo tratamiento que $v = 0$ (sin vector, sin flecha de desplazamiento, sin etiqueta $\Delta x$, sin etiqueta $v$)

### 7.5 Validación de consistencia

Cuando el usuario ingresa manualmente los 4 campos ($x_i$, $v$, $t$, $x_f$), se verifica que cumplan la ecuación MRU:

$$x_f \approx x_i + v \cdot t$$

Tolerancia: $|x_f - (x_i + v \cdot t)| \leq 0.001$ (en unidades SI después de conversión).

Si no se cumple, se muestra un error indicando que los valores no son físicamente posibles.

### 7.6 Tiempo negativo

El sistema **no permite tiempos negativos**. La validación rechaza valores de $t < 0$ con el mensaje "El tiempo no puede ser negativo."

Cuando $t$ es la variable calculada (fórmula $t = (x_f - x_i) / v$), si el resultado es negativo el motor lanza error: "El tiempo calculado es negativo. Verifique los valores ingresados."

---

## 8. Convenciones físicas y unidades

### 8.1 Sistema de unidades

| Magnitud | Unidades disponibles | Factor de conversión a SI |
|----------|---------------------|--------------------------|
| Distancia | m, km | 1 km = 1000 m |
| Tiempo | s, min, h | 1 min = 60 s, 1 h = 3600 s |
| Velocidad | m/s, km/h | 1 km/h = 0.277... m/s |

Las unidades son **independientes** entre sí. Cada magnitud tiene su propio selector, incluyendo $x_i$ y $x_f$ que tienen selectores de distancia independientes (pueden ser m y km simultáneamente).

### 8.2 Coherencia

- Todos los cálculos se realizan internamente en SI (m, s, m/s)
- Los resultados se convierten a la unidad seleccionada por el usuario para mostrar en las etiquetas
- La unidad seleccionada no afecta el modelo físico subyacente
- $x_i$ y $x_f$ pueden tener unidades de distancia diferentes (ej. $x_i$ en km, $x_f$ en m)
- $\Delta x$ siempre usa la unidad de $x_i$ (`x0Unit`)
- Por defecto: **m**, **s**, **m/s**

### 8.3 Convenciones

- Eje X positivo apunta siempre hacia la derecha (no configurable)
- El sentido del movimiento se deduce del signo de la velocidad
- $v > 0$ → movimiento hacia la derecha
- $v < 0$ → movimiento hacia la izquierda
- No existe selector independiente de sentido

---

## 9. Notas de implementación

### 9.1 Pipeline

El flujo de generación de diagramas es:

1. **Detección de inputs** (contar campos llenos; si < 3, renderizar diagrama base)
2. **Validación** de inputs (formato numérico, tiempo no negativo)
3. **Resolución de variable faltante** (detectar cuál de los 4 campos debe auto-computarse)
4. **Conversión de unidades** (entrada → SI → salida)
5. **Resolución física** (cálculo de $x_f$, $v$, $t$ o $x_i$ según corresponda)
6. **Validación de resultado** (tiempo calculado no puede ser negativo; si 4 campos ingresados, verificar consistencia $x_f \approx x_i + v \cdot t$)
7. **Inferencia** del modelo de diagrama (dirección, orientación, visibilidad)
8. **Construcción de escena** (SceneGraph con nodos semánticos)
9. **Layout** (posicionamiento en coordenadas de pantalla)
10. **Renderizado** (generación de SVG)

### 9.2 Diagrama base

Cuando no hay suficientes inputs para resolver (menos de 3 campos numéricos llenos), se salta el pipeline y se renderiza directamente un diagrama base (eje + origen + caja) usando los mismos módulos de layout y render.

### 9.3 Generación del diagrama

La página del generador MRU (`MRUGeneratorPage`) se divide en dos secciones principales:

**Sección izquierda (formulario):** dos cards con borde redondeado (`border: 1px solid #ddd; border-radius: 6px; padding: 1.5rem`), separadas por un gap de `1rem`.

- **Card 1 - "Datos del diagrama"** (`DiagramDataCard`): 4 campos de entrada ($x_i$, $v$, $t$, $x_f$) usando el componente reutilizable `InputWithUnit` (input + selector de unidad). Un botón **"Calcular"** se habilita cuando exactamente 3 campos están llenos; al presionarlo, el motor computa el campo faltante, lo auto-rellena y genera el diagrama.

- **Card 2 - "Elementos del diagrama"** (`DiagramControlsCard`): tabla de controles con filas por elemento ($x_i$, $x_f$, $v$, $t$, $\Delta x$) usando el componente `ControlRow`. Columnas: *Etiqueta*, *Valor*, *Vector*. Los checkboxes tienen tamaño `1rem × 1rem`.

Debajo de ambos cards, un botón **"Generar Diagrama"** genera o regenera el diagrama. También se regenera automáticamente cuando el usuario cambia una unidad de medida o cualquier checkbox de visualización.

Un botón **"Borrar datos"** debajo del formulario resetea todos los inputs, unidades y controles a sus valores por defecto, y limpia el diagrama.

**Sección derecha (diagrama):** componente `DiagramContainer` que muestra header (título "Vista previa" + botón **"Exportar"**) y el SVG generado. Estados vacío/error con `height: 250px`.

### 9.4 Arquitectura

**Entry:**
- `src/main.tsx` → punto de entrada, envuelve la app en `HashRouter` (compatibilidad GitHub Pages)
- `src/App.tsx` → shell mínimo, renderiza `<AppRoutes />`
- `src/router.tsx` → configuración de rutas con React Router

**Layout:**
- `src/ui/components/layout/Header.tsx` → header del sitio (título + subtítulo)
- `src/ui/components/layout/NavBar.tsx` → barra de navegación con `NavLink` a cada generador
- `src/ui/components/layout/Footer.tsx` → footer del sitio
- `src/ui/components/layout/PageLayout.tsx` → layout shell: Header + NavBar + `<Outlet />` + Footer

**Pages:**
- `src/pages/HomePage.tsx` → catálogo de generadores disponibles (cards con `Link`)
- `src/pages/MRUGeneratorPage.tsx` → página del generador MRU; orquesta hooks y componentes de UI

**Hooks:**
- `src/hooks/usePhysicsEngine.ts` → instancia singleton del engine + registry
- `src/hooks/useExportSVG.ts` → lógica de descarga de SVG
- `src/hooks/useDiagramControls.ts` → estado de toggles de visibilidad (etiqueta/valor/vector)
- `src/hooks/useMRUDiagram.ts` → estado completo del generador MRU (inputs, unidades, cálculo, auto-relleno)

**Core (sin cambios):**
- `src/core/units.ts` → tipos y funciones de conversión de unidades
- `src/core/format.ts` → formateo de números (3 decimales, sin decimales si es entero)
- `src/core/layout-engine.ts` → posicionamiento de todos los elementos
- `src/core/renderer.ts` → conversión de nodos posicionados a SVG
- `src/core/module-registry.ts` → registro de módulos de física
- `src/app/engine.ts` → coordinador del pipeline, recibe `controls: DiagramControls` y lo propaga al modelo

**MRU Module (sin cambios):**
- `src/modules/mru/physics.ts` → resolución de la ecuación MRU; valida que $t \geq 0$
- `src/modules/mru/validation.ts` → validación de inputs numéricos y restricción $t \geq 0$
- `src/modules/mru/inference.ts` → inferencia del modelo de diagrama
- `src/modules/mru/scene-builder.ts` → construcción de nodos semánticos
- `src/modules/mru/types.ts` → define `DiagramControls`, `ElementControls`, `MRUDiagramModel`

**UI Components:**
- `src/ui/components/form/InputWithUnit.tsx` → componente reutilizable de input + selector de unidad
- `src/ui/components/form/ControlRow.tsx` → fila individual de la tabla de controles
- `src/ui/components/form/DiagramDataCard.tsx` → card "Datos del diagrama" (4 inputs + botón Calcular)
- `src/ui/components/form/DiagramControlsCard.tsx` → card "Elementos del diagrama" (tabla de controles)
- `src/ui/components/diagram/DiagramContainer.tsx` → contenedor del diagrama (header + SVG + exportar)

**Estilo visual:**
- Fuente: **Inter** (Roboto como fallback), importada vía Google Fonts
- Layout de página: flexbox column (`page-layout`), header + navbar + contenido + footer
- Generador MRU: CSS Grid `grid-template-columns: 320px 1fr`, gap `1rem`, padding `2rem`
- Cards: `border: 1px solid #ddd; border-radius: 6px; padding: 1.5rem; background: white`, gap interno `0.5rem`
- Navbar: links con `.active` en azul (`#2563eb`)
- Estados vacío/error del diagrama: `height: 250px`

Los controles de visualización fluyen así: `MRUGeneratorPage` → `useDiagramControls()` → `controls` → `useMRUDiagram(controls)` → `engine.generate({controls})` → `module.infer()` → `MRUDiagramModel.controls` → `scene-builder.ts` que combina condiciones físicas con los toggles del usuario.

### 9.5 Resolución de variable faltante

El motor detecta qué variable debe calcularse según los campos ingresados al presionar "Calcular" o "Generar Diagrama":

| Campos ingresados por el usuario | Variable a calcular | Fórmula |
|---|---|---|
| $x_i$, $v$, $t$ | $x_f$ | $x_f = x_i + v \cdot t$ |
| $x_i$, $x_f$, $t$ | $v$ | $v = (x_f - x_i) / t$ |
| $x_i$, $x_f$, $v$ | $t$ | $t = (x_f - x_i) / v$ |
| $v$, $t$, $x_f$ | $x_i$ | $x_i = x_f - v \cdot t$ |
| $x_i$, $v$, $t$, $x_f$ | — | Validar consistencia |

La variable calculada se auto-rellena en el input correspondiente y se marca como **computada**.

Si la variable calculada es $t$ y el resultado es negativo, se muestra un error en vez de auto-rellenar.

Reglas adicionales:
- Si el usuario edita el campo auto-computado, pasa a ser considerado **ingresado manualmente** y se valida consistencia con los demás
- Si el usuario cambia una unidad mientras los 4 campos están llenos, se limpia el campo correspondiente a esa unidad y el motor lo re-computa en la nueva unidad:
  - `x0Unit` → limpia $x_i$
  - `xfUnit` → limpia $x_f$
  - `timeUnit` → limpia $t$
  - `velUnit` → limpia $v$
- Si al cambiar una unidad solo hay 3 campos llenos, el motor re-computa el campo faltante con la nueva unidad sin necesidad de limpiar nada
- No se pueden computar 2 variables simultáneamente. El usuario debe proveer al menos 3 campos

### 9.6 Formato decimal

La función `formatValue(value: number): string`:
1. Redondea a 3 decimales: `Math.round(value * 1000) / 1000`
2. Si el resultado es entero (sin parte decimal), devuelve la representación entera: `5` en vez de `5.000`
3. Si tiene decimales, devuelve hasta 3: `5.123`, `0.5`, `3.1`


