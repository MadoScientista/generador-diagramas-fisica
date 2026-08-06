# Reglas de Diseño — Gráficos MRUV

> Este documento **no es un skill de dominio físico**. Es una especificación de presentación
> para un agente de código que ya tiene acceso a `mruv-physics-domain` (skill de dominio).
> Aquí no se derivan ni se validan ecuaciones — solo se define **cómo se muestra** el resultado
> ya resuelto por ese skill. Si en algún punto de este documento aparece la necesidad de decidir
> un signo, un caso degenerado, o una condición física, eso indica que la lógica pertenece al
> skill de dominio, no a este documento — repórtalo en vez de resolverlo aquí.

## 1. Contrato de entrada esperado

Este documento asume que el agente ya invocó `mruv-physics-domain` y cuenta con la tupla
resuelta y validada:

```
{ xi, xf, vi, vf, a, t }
```

Si el skill de dominio devolvió un código de error (§9 de `mruv-physics-domain`), **no se
grafica nada** — ese caso no está cubierto por este documento y debe resolverse en la capa de
manejo de errores de la app, no aquí.

## 2. Marco temporal

| Regla | Especificación |
|---|---|
| `ti` | Siempre `0`, independientemente de si el problema original definió un `xi`/tiempo de referencia distinto. Es el origen del eje temporal del gráfico, no una variable física del skill de dominio. |
| `tf` | Siempre igual a `t` (el tiempo total resuelto por el skill de dominio). |
| Rango de graficación | La **curva** se grafica sobre `τ ∈ [0, t]` sin margen adicional. El eje visible (ticks) puede extenderse hasta el último tick "bonito", que es el valor más próximo `≥ t` alcanzable con entre 5 y 10 ticks (§10), y la flecha queda un paso de ticks adicional después del último tick. Los tres gráficos (x, v, a) comparten este mismo eje temporal. |

La curva nunca se dibuja más allá de `t`; solo el eje (ticks y flecha) se extiende para mantener
el espaciado uniforme entre los ticks generados (5 a 10 por eje), y el espacio entre el último
tick y la flecha es igual a la distancia entre ticks. El rango de los datos sigue definido por
el enunciado del problema.

### Eje vertical y el caso y ≥ 0

- El número de ticks del eje vertical **no es fijo**: `computeNiceTicks()` devuelve entre
  **5 y 10 ticks** (§10). La geometría se deriva del nº real de ticks generados `n`:
  - Caso mixto (ventana que cruza el `0`): espaciado `340 / n` px; la línea mide 340px.
  - Caso y ≥ 0: espaciado `340 / (n + 1)` px; la línea mide `340 · n / (n + 1)` px.
  Los valores históricos (~56.7px de espaciado, ~283px de línea) corresponden a los casos
  canónicos `n = 6` (mixto) y `n = 5` (y ≥ 0), cuando el algoritmo devuelve el conteo objetivo.
- En el caso y ≥ 0 (todos los valores del gráfico ≥ 0) la línea vertical del eje Y **nace en
  el `0`** (que coincide con la base del área de trazado) y **se acorta una distancia de tick
  respecto del caso mixto**. Todo el gráfico se **centra verticalmente** en el SVG
  (`translateY`), por lo que la flecha queda a **≈50px** del borde superior en vez de a `10px`.
  No existe ningún tramo de la línea por debajo del `0`.
- En el resto de casos (ventana que cruza el `0`) la línea vertical conserva su altura
  completa desde la base del área de trazado, extendiéndose por debajo del `0` para mostrar
  los valores negativos (longitud 340px).
- **Serie horizontal (constante) con `c ≠ 0`**: si todos los valores `y` son iguales a una
  constante `c` (con tolerancia `1e-9` relativa a `c`) y `c ≠ 0`, la ventana Y se **expande a
  `[0, 2c]`** (o `[2c, 0]` si `c < 0`) antes de calcular los ticks. Así la línea queda centrada
  en la ventana y existen al menos **2 ticks por encima** de ella en lugar de graficarla sobre
  el último tick (que hacía el gráfico verse casi vacío). Ejemplos: `a = 2` → ticks
  `0, 1, 2, 3, 4`; `a = -2` → ticks `-4, -3, -2, -1, 0`. Si `c = 0` (la línea coincide con el
  eje) no se expande: se mantiene el comportamiento actual.

## 3. Eje horizontal

- El eje horizontal es **siempre** el tiempo `t`, en los tres gráficos (x-t, v-t, a-t).
- Esto implica que los tres gráficos son directamente comparables/alineables entre sí si la app
  los muestra simultáneamente; conviven en una sola tarjeta con pestañas (§7).

## 4. Unidades

- Los gráficos muestran los valores en las **unidades seleccionadas en los selectores del
  formulario**: posición → `xiUnit`, velocidad → `viUnit`, aceleración → `aUnit`, tiempo →
  `timeUnit` (los pares `xf`/`vf` pueden diferir sin afectar al eje).
- La física interna se calcula siempre en SI: `computeGraphData` recibe valores normalizados a
  SI (la página convierte los valores resueltos con `toSI` usando la unidad de cada variable) y
  los componentes de gráfico convierten a la unidad de visualización con `fromSI` en la
  frontera de salida — igual que el skill de dominio (`mruv-physics-domain` §7: las
  conversiones se hacen antes de cualquier cálculo).
- Los números de los ticks se recalculan con la ventana "bonita" sobre los valores **ya
  convertidos** a la unidad de visualización; al cambiar una unidad, los ticks cambian
  automáticamente.

## 5. Puntos de interés a marcar

Actualmente **no se marca ningún punto de interés** en los gráficos.

- `computeGraphData` devuelve `tauStar: null` sin calcular el valor de `τ*` (cambio de
  sentido de la velocidad: `τ* = -vi / a`). No se realiza el cálculo porque no se usa.
- Esta decisión es reversible: si en el futuro se desea marcar `τ*`, basta con calcular
  `-vi / a` y devolverlo en vez de `null` en `graph-helpers.ts`.

*(Puntos de interés adicionales — como extremos `(0, xi)`/`(t, xf)`, o cruces de a=0 en
movimiento por tramos — no están definidos en esta versión del documento y no deben agregarse
sin actualizarlo explícitamente.)*

## 6. Dimensiones del SVG

- Cada gráfico se renderiza en un SVG de **400px de ancho × 400px de alto**, fijo para los
  tres gráficos (x-t, v-t, a-t) — no varía según el contenido o la densidad de datos.
- Constantes de layout: `MARGIN_LEFT = 110` (eje Y), `MARGIN_BOTTOM = 50`, `RIGHT_PAD = 50`,
  `EDGE_PAD = 10` (punta de la flecha del eje Y en el caso mixto). `Y_TITLE_X = 60` es el
  ancla del título rotado del eje Y.
- La geometría se deriva del nº real de ticks generados (`n_t` en el eje X, `n` en el eje Y):
  - **Eje X**: `plotW = 240 · (n_t − 1) / n_t`; `xSpacing = 240 / n_t`. La flecha queda a un
    paso de ticks del último tick y su punta cae **siempre en `x = 350`** (margen derecho
    fijo de 50px), independientemente de `n_t`.
  - **Eje Y, caso mixto** (ventana que cruza el `0`): espaciado `340 / n` px; la línea mide
    340px, la base del área de trazado (el tick mínimo, que es negativo) cae siempre en
    `y = 350`, el `0` queda en el interior (la línea tiene un tramo por debajo del `0`) y la
    flecha a `10px` del borde superior.
  - **Eje Y, caso y ≥ 0**: espaciado `340 / (n + 1)` px; la línea mide `340 · n / (n + 1)` px
    (se acorta una distancia de tick), nace en el `0` y todo el gráfico se **centra
    verticalmente**, quedando la flecha a **≈50px** del borde superior.
- Ejemplo canónico: con `n_t = 6` y `n = 6` (mixto) el espaciado es ≈56.7px y el área de
  trazado mide `plotW = 200px` × `plotH = 283.3px`; en el caso y ≥ 0 con `n = 5` la línea del
  eje Y mide ≈283px (espaciado ≈56.7px) y `plotH = 226.7px`.

## 7. Estructura de presentación

Los gráficos están integrados dentro del componente `DiagramSection`, que contiene un
**selector tipo pill** (switcher) con dos vistas: **Diagrama** y **Gráficos**.

- El pill es un `role="tablist"` con dos botones `role="tab"`, navegables con
  ArrowLeft/ArrowRight.
- La vista activa predeterminada es **Diagrama**.
- No hay una `CollapsibleCard` separada para gráficos — el contenido del panel derecho
  conmuta entre el SVG del diagrama y el sistema de pestañas de gráficos.

### Vista Gráficos

- Debajo del pill hay una barra de **sub-tabs** con `role="tablist"`: "Posición",
  "Velocidad", "Aceleración". También navegables con ArrowLeft/ArrowRight.
- Solo un gráfico es visible a la vez; el activo por defecto es el primero ("Posición").
- El SVG del gráfico activo se renderiza en `.graph-panel-body` > `.graph-svg-container`.
- Cada sub-tab activo usa `border-bottom: 2px solid #6b6a63`; los inactivos tienen texto
  `#a3a199`.

### Estado sin datos (vista Gráficos)

- Los tres gráficos (Posición, Velocidad, Aceleración) se proporcionan **siempre** a
  `DiagramSection`, incluso sin datos resueltos — no existe `graphsDisabled`.
- Cuando no hay datos, cada gráfico se renderiza como un **plano vacío** (`renderEmptyGraph`):
  solo los **ejes** con sus flechas, el **símbolo** y la **unidad** del eje Y (p. ej. `a[m/s²]`),
  la etiqueta `t[tiempo]` y los títulos "Posición"/"Velocidad"/"Aceleración" y "Tiempo".
  **No** se dibujan ticks ni línea de gráfico (no habría qué graficar). Los **dos ejes miden
  lo mismo** (`plotW = 240px`) y el conjunto queda **centrado** en el área de trazado: el eje
  horizontal está en `y = 300` y el vertical sube de ahí hasta `y = 60`
  (`arrowEndY = axisY0 - plotW`); los títulos y la etiqueta de símbolo se centran/posicionan
  respecto a ese tramo.
- Los sub-tabs **siempre** están presentes e interactivos. El activo por defecto es
  "Posición" (`activeGraphTab` se inicializa con `graphs[0]?.id`), y la selección del usuario
  se **recuerda** aunque borre inputs: `DiagramSection` no se remonta al vaciar un campo
  (no hay `key` dinámica), por lo que al re-ingresar datos se vuelve al mismo gráfico y a la
  misma vista (Diagrama o Gráficos) en la que estaba.
- La vista Gráficos **siempre es accesible** desde el pill, incluso sin datos.

## 8. Títulos y etiquetas

| Elemento | Texto |
|---|---|---|
| Pill de navegación (primera opción) | `Diagrama` |
| Pill de navegación (segunda opción) | `Gráficos` |
| Sub-tab x vs t | `Posición` |
| Sub-tab v vs t | `Velocidad` |
| Sub-tab a vs t | `Aceleración` |
| Título del eje Y (rotado, font-size 13) | `Posición` / `Velocidad` / `Aceleración` según el gráfico |
| Título del eje X (font-size 13) | `Tiempo` |
| Sin datos (vista Gráficos) | Plano vacío: solo ejes con flechas, símbolo + unidad (`a[m/s²]`, ...), `t[s]` y títulos — sin línea ni ticks |

Las unidades se muestran en las **etiquetas de los ejes** (`x[m]`, `v[m/s]`, `a[m/s²]`,
`t[s]`), no en los títulos ni etiquetas de pestaña.

### 8.1 Etiquetas de ejes y renderizado de superíndices

La etiqueta del eje Y se construye con el **símbolo** de la variable (`x`, `v` o `a`) seguido
de la unidad entre corchetes: `renderGraph(points, symbol, yUnit, timeUnit, yTitle, xTitle)`.
Con datos ausentes se usa `renderEmptyGraph(symbol, yUnit, timeUnit, yTitle, xTitle)`, que
dibuja el mismo marco (ejes, flechas, símbolo+unidad y títulos) sin línea de curva ni ticks.
La unidad se procesa con `parseUnit` y se renderiza con `renderSegments`, generando `<tspan>`
SVG para superíndices:

| Entrada | Output SVG |
|---------|-----------|
| `symbol='a'`, `yUnit='m/s^2'` | `<text ...>a[<tspan>m/s</tspan><tspan dy="-4" font-size="10">2</tspan>]</text>` |
| `symbol='v'`, `yUnit='m/s'` | `<text ...>v[<tspan>m/s</tspan>]</text>` |
| `symbol='x'`, `yUnit='m'` | `<text ...>x[<tspan>m</tspan>]</text>` |

El eje horizontal usa la etiqueta `t[{timeUnit}]` en texto plano (`t[s]`, `t[min]`, `t[h]`).

Esta estrategia es la misma que usan los labels del diagrama principal (`TextSegment[]` → `<tspan>`).

## 9. Fuera de alcance de este documento

- Escalas no lineales, auto-zoom, o ajuste dinámico de ejes.
- Estilo visual (colores, grosor de línea, tipografía) — pertenece a un sistema de diseño
  aparte, no a estas reglas de graficación.
- Movimiento por tramos múltiples (requiere el orquestador de segmentos, no cubierto aquí).
- Resolución de muestreo temporal (cuántos puntos entre `0` y `t` para dibujar la curva).
- Comportamiento ante `AMBIGUOUS_SIGN` no resuelto — se asume que la capa de dominio ya lo
  resolvió antes de llegar a graficación.

Si el agente de código encuentra un caso no cubierto por estas 8 reglas, debe señalarlo en vez
de inferir una solución de diseño no especificada aquí.

## 10. Decisiones de implementación

| Regla | Valor |
|---|---|
| Renderizado de curva | Línea continua (`<polyline>`), no puntos individuales |
| Muestreo temporal | 100 puntos equiespaciados entre 0 y t |
| τ* renderizado | Deshabilitado — `tauStar` siempre se devuelve como `null` |
| Vista predeterminada del pill | `Diagrama` (la vista Gráficos se activa al hacer clic en "Gráficos") |
| Ubicación en la página | Integrada en `DiagramSection` como segunda pestaña del pill de navegación |
| Visibilidad de sección | Siempre visible; los 3 gráficos se proveen siempre (`graphs`), como plano vacío si no hay datos resueltos — no hay estado `disabled` ni placeholder textual |
| Estilo de curva | Stroke `#2563eb`, stroke-width `2`, sin fill |
| Ejes | Con flechas, color `#000`, etiquetas en español |
| Font-size eje Y (etiqueta) | `14px` (etiqueta de eje Y se renderiza mediante `renderSegments` + `parseUnit` para superíndices) |
| Font-size eje X (etiqueta) | `14px` (texto plano: `t[{timeUnit}]`) |
| Posición etiqueta eje X (`t[s]`) | Texto plano `t[{timeUnit}]` centrado **debajo de la flecha del eje horizontal**: `x = arrowEndX` (350), `y = axisY0Final + 28` (los números de los ticks van en `axisY0Final + 16`). `axisY0Final = toY(0) + translateY`: en el caso mixto `translateY = 0` y `toY(0)` queda dentro del área de trazado (depende del rango de datos); en el caso y ≥ 0 la base `toY(0) = 10 + 340·n/(n+1)` se centra con `translateY`, quedando los ticks ≈ `y = 350` y la etiqueta `t[s]` ≈ `y = 362` (con `n = 5`) |
| Posición etiqueta eje Y (`x[m]`) | Texto horizontal **a la izquierda de la punta de la flecha** del eje Y: anclado con `text-anchor="end"` en `(MARGIN_LEFT − 16, arrowEndYFinal + 4)` (`x = 94`; `arrowEndYFinal` ≈ 50 en el caso y ≥ 0, `10` en el mixto). Contenido: símbolo (`x`, `v` o `a`) + unidad entre corchetes, con superíndice vía `parseUnit` |
| Font-size ticks | `11px` (valores numéricos en ambos ejes) |
| API `renderGraph` | `(points: { t; y }[], symbol: 'x' \| 'v' \| 'a', yUnit: string, timeUnit: string, yTitle: string, xTitle: string)` — `t` e `y` llegan **ya convertidos a la unidad de visualización** (los componentes de gráfico aplican `fromSI`); el renderer solo grafica y etiqueta. `yTitle`/`xTitle` se dibujan como títulos de eje dentro del gráfico (`Posición`/`Tiempo`, etc.) |
| Ticks de ejes | Ambos ejes usan `computeNiceTicks()` con pasos "bonitos" `{1, 2, 2.5, 5, 10} × 10^n`. El algoritmo elige el paso que minimiza el **overshoot** del último tick sobre el máximo de los datos, entre todas las configuraciones con entre **5 y 10 ticks**; a igual overshoot prefiere el paso mayor (menos ticks). Como el nº de ticks puede variar (5–10), la geometría se deriva del nº real devuelto (§2, §6): en el eje X `plotW = 240·(n_t−1)/n_t` y `xSpacing = 240/n_t`; en el eje Y el espaciado es `340/n` (mixto) o `340/(n+1)` (y ≥ 0). El eje horizontal oculta el tick `t = 0` (quedan `n_t − 1` visibles). El `0` siempre cae en el eje vertical. La flecha se dibuja a un paso de ticks del último tick (su punta queda fija en `x = 350`). Fallback (caso degenerado): si ningún paso de 5–10 ticks cubre el rango, se usa una ventana fija de `count` ticks subiendo al siguiente paso "bonito" hasta cubrir el máximo |
| Tamaño SVG | Fijo 400×400 (viewBox, no responsive) |
| Exportación | Botones "Exportar SVG" y "Exportar PNG" en el header de `DiagramSection`. Exportan el elemento activo (diagrama o gráfico según la pestaña seleccionada en el pill). PNG vía `useExportPNG` (canvas, escala 2×, tamaños según viewBox) |
| Caso a=0 | Mostrar igualmente (curvas lineales/constantes) |