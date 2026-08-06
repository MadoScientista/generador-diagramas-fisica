# Reglas del Generador Plano Cartesiano

## Componentes

Dos columnas con las proporciones del generador MRUV (`grid-template-columns: 320px 1fr`).

## Columna izquierda: Tarjetas de ajustes

Tres tarjetas desplegables (patrón `CollapsibleCard`) con comportamiento de acordeón: al abrir una se cierra la anterior, igual que en el generador MRUV. Orden:

1. **General** (contiene los subtítulos **Ejes** y **Cuadrícula**)
2. **Eje X**
3. **Eje Y**

No hay botón "Borrar datos" (es exclusivo de los generadores de física).

### General > Ejes
- Visibilidad: toggle
- Grosor: stepper numérico (pixeles)

### General > Cuadrícula
- Visibilidad: toggle
- Grosor: stepper numérico (pixeles)
- Estilo: Línea, Puntos, Segmentada

### Eje X / Eje Y
- Visibilidad: toggle
- Mínimo: stepper numérico
- Máximo: stepper numérico
- Paso: stepper numérico (mayor a 0 y menor o igual al mayor valor absoluto entre el mínimo y el máximo del eje, admite decimales)
- Unidad de medida: input texto

Los inputs numéricos usan un stepper con forma `[- input +]`: los botones incrementan/decrementan el valor de a 1, respetan los límites `min`/`max` del campo (los botones se deshabilitan al llegar a un límite) y ocultan los spinners nativos del navegador.

## Columna derecha: Tarjeta Plano Cartesiano

- Canvas 500 x 500 pixeles donde se renderiza el plano cartesiano
- Botón de Exportar (descarga SVG con nombre `plano-cartesiano.svg`)

## Reglas de renderizado

- El plano se re-renderiza en vivo ante cada cambio de ajustes (no hay botón "Calcular").
- **Ticks** = múltiplos del **Paso** desde 0 dentro del rango `[min, max]`, más el mínimo y el máximo siempre (aunque no sean múltiplos del paso). Ej: Min -10, Max 10, Paso 3 → ticks -10, -9, -6, -3, 0, 3, 6, 9, 10.
- **Cuadrícula** limitada al rectángulo delimitado por los rangos de los ejes (`[xMin, xMax] × [yMin, yMax]`). Estilo "Puntos" dibuja solo puntos en las intersecciones (sin líneas).
- **Ejes**: cada eje se dibuja en la posición del 0; si 0 queda fuera del rango, el eje se ajusta al borde del área de trazado. La línea del eje se extiende un paso de tick más allá del último tick hacia el extremo positivo (donde termina la flecha). Además, si el mínimo del eje es menor a 0, el inicio de la línea también se extiende un paso de tick hacia el lado negativo (solo en el eje cuyo min sea < 0). Ambas extensiones se limitan para que no salgan del lienzo de 500 px. Marca de tick con etiquetas numéricas (máx. 3 decimales) en cada división, salvo el cero del origen que sigue las reglas siguientes.
- **Etiquetas de unidad**: la etiqueta del eje X (`x (m)`) se dibuja horizontal, centrada bajo la flecha del eje horizontal. La etiqueta del eje Y (`y (m)`) se dibuja horizontal, a la izquierda de la flecha del eje vertical (sin rotación).
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

- `src/modules/plano-cartesiano/` — `types.ts`, `defaults.ts`, `render.ts` (renderizador SVG puro, no es un `PhysicsModule`).
- `src/hooks/usePlanoCartesiano.ts` — estado de ajustes y generación del SVG.
- `src/ui/components/form/PlanoCartesianoSettingsSections.tsx` — secciones `GeneralSection` (compone `AxesSection` + `GridSection`), `AxisSection`, y el stepper numérico `NumberStepper`.
- `src/ui/components/diagram/PlanoCartesianoCard.tsx` — tarjeta del plano con exportación.
- `src/pages/PlanoCartesianoGeneratorPage.tsx` — composición de las tarjetas colapsables.
