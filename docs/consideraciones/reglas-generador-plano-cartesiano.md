# Reglas del Generador Plano Cartesiano

## Componentes

Dos columnas con las proporciones del generador MRUV (`grid-template-columns: 320px 1fr`).

## Columna izquierda: Tarjetas de ajustes

Fila de **plantillas rápidas (presets)** sobre las tarjetas: Estándar, Solo ejes, Primer cuadrante, Solo cuadrícula. Cada botón aplica un conjunto completo de ajustes.

Tres tarjetas desplegables (patrón `CollapsibleCard`) con comportamiento de acordeón: al abrir una se cierra la anterior, igual que en el generador MRUV. Orden:

1. **General** (contiene los subtítulos **Ejes** y **Cuadrícula**; cada subtítulo lleva una línea divisoria suave encima, `border-top` en `--plano-line`)
2. **Ejes** (contiene los subtítulos **Eje X** y **Eje Y**, con la misma línea divisoria suave que en General)
3. **Apariencia**

No hay botón "Borrar datos" (es exclusivo de los generadores de física).

Cada fila de ajuste usa `settings-row`: etiqueta a la izquierda y control alineado a la derecha (`justify-content: space-between`).

### General > Ejes
- Visibilidad: toggle
- Grosor: selector formato pill con 4 opciones (1–4, sin unidad); la opción activa se rellena en el azul de los toggles (`#2563eb`)
- Color: selector de 4 swatches (Negro, Gris, Azul, Rojo — azul y rojo desaturados, `PLANO_COLOR_OPTIONS` en `defaults.ts`: `#1f2430`, `#7a8595`, `#4a7ab8`, `#b05a55`). La selección se indica con un check blanco interno (`✓`), hover con anillo `--plano-line`

### General > Cuadrícula
- Visibilidad: toggle
- Grosor: selector formato pill con 4 opciones (1–4, sin unidad); la opción activa se rellena en el azul de los toggles (`#2563eb`)
- Estilo: selector formato pill con 3 opciones representadas simbólicamente (`—` Línea, `···` Puntos, `- -` Segmentada); la opción activa se rellena en el azul de los toggles (`#2563eb`). El nombre descriptivo se expone como `aria-label`
- Color: selector de 4 swatches

### Ejes > Eje X / Eje Y
- Visibilidad: toggle
- Rango: grupo de 3 columnas con las etiquetas **Min** / **Max** / **Paso** encima de una fila de inputs numéricos (sin botones `+`/`−` ni spinners nativos del navegador). Paso mayor a 0 y menor o igual al mayor valor absoluto entre el mínimo y el máximo del eje, admite decimales
- Etiqueta y unidad: grupo de 2 columnas con las etiquetas **Etiqueta** / **Unidad de medida** encima de una fila de inputs de texto (p. ej. `x` y `m`)

### Apariencia
- Color de etiquetas: selector de 4 swatches (Negro, Gris, Azul, Rojo)
- Tamaño de etiquetas: stepper numérico (8–20 px, por defecto 11)
- Fondo del plano: selector Blanco / Transparente

El único stepper numérico con forma `[- input +]` restante es el de tamaño de etiquetas (Apariencia); los groscores se eligen con selectores formato pill. Los inputs del rango de los ejes (Min/Max/Paso) son inputs numéricos planos, centrados y sin botones, con los spinners nativos del navegador ocultos.

## Columna derecha: Tarjeta Plano Cartesiano

- Canvas 500 x 500 pixeles donde se renderiza el plano cartesiano
- Botones de exportar: **Exportar SVG** (descarga `plano-cartesiano.svg`) y **Exportar PNG** (descarga `plano-cartesiano.png` a 1000×1000, escala 2×)
- Estética "cuaderno": fondo de papel con trama de puntos sutil, tarjeta con sombra suave, título y números del plano en fuente mono (IBM Plex Mono)

> El export PNG es 100% client-side (canvas + `toBlob`, sin dependencias ni backend) por lo que funciona igual en GitHub Pages. Espera `document.fonts.ready` antes de dibujar para incluir IBM Plex Mono. Si el fondo del plano es transparente, el PNG también lo es.

## Reglas de renderizado

- El plano se re-renderiza en vivo ante cada cambio de ajustes (no hay botón "Calcular").
- **Colores**: los colores de ejes, cuadrícula y etiquetas son configurables (`settings.axes.color`, `settings.grid.color`, `settings.appearance.labelColor`). Por defecto tinta `#1f2430` y cuadrícula azul "papel milimetrado" `#4a7ab8`.
- **Fondo**: `appearance.background` es `white` (rect blanco) o `transparent` (rect sin relleno, deja ver la trama de papel del contenedor).
- **Tipografía**: los números de tick, etiquetas de unidad y el título de la tarjeta usan IBM Plex Mono (`--plano-mono`). El exportado SVG referencia la familia por nombre con fallback a `monospace`.
- **Animación**: las tarjetas y presets entran con stagger al cargar la página (sin animación en la re-renderización del plano). Todo respeta `prefers-reduced-motion`.
- **Ticks** = múltiplos del **Paso** desde 0 dentro del rango `[min, max]`, más el mínimo y el máximo siempre (aunque no sean múltiplos del paso). Ej: Min -10, Max 10, Paso 3 → ticks -10, -9, -6, -3, 0, 3, 6, 9, 10.
- **Cuadrícula** limitada al rectángulo delimitado por los rangos de los ejes (`[xMin, xMax] × [yMin, yMax]`). Estilo "Puntos" dibuja solo puntos en las intersecciones (sin líneas).
- **Ejes**: cada eje se dibuja en la posición del 0; si 0 queda fuera del rango, el eje se ajusta al borde del área de trazado. La línea del eje se extiende un paso de tick más allá del último tick hacia el extremo positivo (donde termina la flecha). Además, si el mínimo del eje es menor a 0, el inicio de la línea también se extiende un paso de tick hacia el lado negativo (solo en el eje cuyo min sea < 0). Ambas extensiones se limitan para que no salgan del lienzo de 500 px. La línea termina en la base del triángulo de la flecha (`endX - ARROW_DEPTH` en el eje X, `endY + ARROW_DEPTH` en el eje Y), de modo que la punta de la flecha coincide con el extremo del segmento. El triángulo es isósceles: la base mide `2 × ARROW_HALF_WIDTH` (igual al ancho de un tick, `ARROW_HALF_WIDTH = TICK_SIZE`) y su profundidad `ARROW_DEPTH = 2 × TICK_SIZE`. Marca de tick con etiquetas numéricas (máx. 3 decimales) en cada división, salvo el cero del origen que sigue las reglas siguientes.
- **Etiquetas de unidad**: la etiqueta del eje X (por defecto `x (m)`) se dibuja horizontal, centrada bajo la flecha del eje horizontal. La etiqueta del eje Y (por defecto `y (m)`) se dibuja horizontal, a la izquierda de la flecha del eje vertical (sin rotación). El nombre del eje es configurable (`settings.xAxis.label` / `settings.yAxis.label`, por defecto `x`/`y`) y el formato es `{etiqueta} ({unidad})`.
- **Cero del origen**: cuando el 0 coincide con una posición de tick y **ambos ejes son visibles**, se renderiza solo el/los cero(s) correspondientes según los mínimos de los ejes:
  1. Si `min X < 0` y `min Y < 0`: un único cero a la altura de los números del eje X, a la izquierda del eje vertical.
  2. Si `min X ≥ 0` (y `min Y < 0`): solo se renderiza el cero del eje Y.
  3. Si `min Y ≥ 0` (y `min X < 0`): solo se renderiza el cero del eje X.
  4. Si `min X ≥ 0` y `min Y ≥ 0`: se renderizan ambos ceros.

  Si un eje individual no es visible (`Eje X` o `Eje Y` desactivado), el otro eje renderiza su propio cero (siempre que 0 esté dentro de su rango): si el eje X no es visible, el eje Y renderiza su 0; si el eje Y no es visible, el eje X renderiza su 0. Si la visibilidad global "Ejes" está desactivada, no se renderiza ningún cero.
- **Validación**: Min debe ser menor que Max; Paso debe ser un número mayor que 0 y menor o igual al mayor valor absoluto entre el mínimo y el máximo del eje (ej: min -50, max 20 → paso máximo 50; min -10, max 100 → paso máximo 100). Si falla, se muestra un mensaje de error en español en la tarjeta del plano.

## Navegación

- Ruta: `/generador/plano-cartesiano`
- Visible en la NavBar y en la HomePage.

## Implementación

- `src/modules/plano-cartesiano/` — `types.ts`, `defaults.ts`, `presets.ts`, `render.ts` (renderizador SVG puro, no es un `PhysicsModule`).
- `src/hooks/usePlanoCartesiano.ts` — estado de ajustes, `update` por sección, `applySettings` para presets, y generación del SVG.
- `src/hooks/useExportSVG.ts` / `src/hooks/useExportPNG.ts` — exportación SVG (Blob directo) y PNG (canvas a escala 2×).
- `src/ui/components/form/PlanoCartesianoSettingsSections.tsx` — secciones `GeneralSection` (compone `AxesSection` + `GridSection`), `AxisSection`, `AxesCardSection` (compone los subtítulos **Eje X** / **Eje Y** y dos `AxisSection`), `AppearanceSection`, y los controles compartidos `SettingRow`, `ColorField` (swatches con check), `PillSelector` (con opción `symbolic` para el estilo de cuadrícula), `NumberStepper`, `AxisRangeFields` (grupo Min/Max/Paso) y `AxisLabelFields` (grupo Etiqueta/Unidad de medida).
- `src/ui/components/diagram/PlanoCartesianoCard.tsx` — tarjeta del plano con exportación.
- `src/pages/PlanoCartesianoGeneratorPage.tsx` — presets, composición de las tarjetas colapsables y stagger de entrada.
- Estilos: tokens de diseño (`--plano-*`) y animaciones en `src/App.css`.
