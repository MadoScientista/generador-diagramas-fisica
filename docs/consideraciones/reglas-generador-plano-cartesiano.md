# Reglas del Generador Plano Cartesiano

## Componentes

Dos columnas con las proporciones del generador MRUV (`grid-template-columns: 320px 1fr`).

## Columna izquierda: Tarjetas de ajustes

Cuatro tarjetas desplegables (patrón `CollapsibleCard`) con comportamiento de acordeón: al abrir una se cierra la anterior, igual que en el generador MRUV. Orden:

1. **Ejes**
2. **Cuadrícula**
3. **Eje X**
4. **Eje Y**

No hay botón "Borrar datos" (es exclusivo de los generadores de física).

### Ejes
- Visibilidad: toggle
- Grosor: pixeles

### Cuadrícula
- Visibilidad: toggle
- Grosor: pixeles
- Estilo: Línea, Puntos, Segmentada

### Eje X / Eje Y
- Visibilidad: toggle
- Mínimo: input numérico
- Máximo: input numérico
- Divisiones: input numérico
- Unidad de medida: input texto

## Columna derecha: Tarjeta Plano Cartesiano

- Canvas 500 x 500 pixeles donde se renderiza el plano cartesiano
- Botón de Exportar (descarga SVG con nombre `plano-cartesiano.svg`)

## Reglas de renderizado

- El plano se re-renderiza en vivo ante cada cambio de ajustes (no hay botón "Calcular").
- **Ticks** = número de divisiones entre Min y Max. Paso = `(Max - Min) / Ticks`. Ej: Min -10, Max 10, Ticks 10 → paso 2.
- **Cuadrícula** limitada al rectángulo delimitado por los rangos de los ejes (`[xMin, xMax] × [yMin, yMax]`). Estilo "Puntos" dibuja solo puntos en las intersecciones (sin líneas).
- **Ejes**: cada eje se dibuja en la posición del 0; si 0 queda fuera del rango, el eje se ajusta al borde del área de trazado. La línea del eje se extiende un paso de tick más allá del último tick hacia el extremo positivo (donde termina la flecha). Además, si el mínimo del eje es menor a 0, el inicio de la línea también se extiende un paso de tick hacia el lado negativo (solo en el eje cuyo min sea < 0). Ambas extensiones se limitan para que no salgan del lienzo de 500 px. Marca de tick con etiquetas numéricas (máx. 3 decimales) en cada división, salvo el cero del origen que sigue las reglas siguientes.
- **Etiquetas de unidad**: la etiqueta del eje X (`x (m)`) se dibuja horizontal, centrada bajo la flecha del eje horizontal. La etiqueta del eje Y (`y (m)`) se dibuja horizontal, a la izquierda de la flecha del eje vertical (sin rotación).
- **Cero del origen**: cuando el 0 coincide con una posición de tick, se renderiza solo el/los cero(s) correspondientes según los mínimos de los ejes:
  1. Si `min X < 0` y `min Y < 0`: un único cero a la altura de los números del eje X, a la izquierda del eje vertical.
  2. Si `min X ≥ 0` (y `min Y < 0`): solo se renderiza el cero del eje Y.
  3. Si `min Y ≥ 0` (y `min X < 0`): solo se renderiza el cero del eje X.
  4. Si `min X ≥ 0` y `min Y ≥ 0`: se renderizan ambos ceros.
- **Validación**: Min debe ser menor que Max; Ticks debe ser un entero ≥ 1. Si falla, se muestra un mensaje de error en español en la tarjeta del plano.

## Navegación

- Ruta: `/generador/plano-cartesiano`
- Visible en la NavBar y en la HomePage.

## Implementación

- `src/modules/plano-cartesiano/` — `types.ts`, `defaults.ts`, `render.ts` (renderizador SVG puro, no es un `PhysicsModule`).
- `src/hooks/usePlanoCartesiano.ts` — estado de ajustes y generación del SVG.
- `src/ui/components/form/PlanoCartesianoSettingsSections.tsx` — secciones `AxesSection`, `GridSection`, `AxisSection`.
- `src/ui/components/diagram/PlanoCartesianoCard.tsx` — tarjeta del plano con exportación.
- `src/pages/PlanoCartesianoGeneratorPage.tsx` — composición de las tarjetas colapsables.
