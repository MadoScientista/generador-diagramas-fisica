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
| Rango de graficación | `τ ∈ [ti, tf] = [0, t]`, sin margen adicional antes o después. Los tres gráficos (x, v, a) comparten este mismo rango temporal. |

No se extiende el rango más allá de `[0, t]` aunque el vértice u otro punto de interés quede
cerca del borde — el rango de graficación está definido por el enunciado del problema, no por
conveniencia visual.

## 3. Eje horizontal

- El eje horizontal es **siempre** el tiempo `t`, en los tres gráficos (x-t, v-t, a-t).
- Esto implica que los tres gráficos son directamente comparables/alineables entre sí si la app
  los muestra simultáneamente; conviven en una sola tarjeta con pestañas (§7).

## 4. Unidades

- Por defecto, todos los gráficos se muestran en **unidades SI**: metros (m) para posición,
  metros por segundo (m/s) para velocidad, metros por segundo al cuadrado (m/s²) para
  aceleración, segundos (s) para tiempo.
- Cualquier conversión de unidad de entrada/salida (si la app la ofrece) ocurre **antes** de
  llegar a esta capa de graficación — igual que en el skill de dominio (§7 de
  `mruv-physics-domain`: las conversiones se hacen en una función pura de normalización antes
  del resolver). Este documento no define lógica de conversión.

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

- Cada gráfico se renderiza en un SVG de **400px de ancho × 400px de alto**.
- Esta dimensión es fija para los tres gráficos (x-t, v-t, a-t) — no varía según el contenido
  o la densidad de datos.

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

- Cuando no hay datos resueltos (`graphsDisabled=true`), el body del panel de gráficos
  muestra la leyenda "Ingrese datos del diagrama" en gris claro / italic.
- Los sub-tabs se renderizan igualmente como etiquetas no interactivas
  (`.sub-tab--label`, `cursor: default`) para mantener la estructura visual.
- La vista Gráficos **siempre es accesible** desde el pill, incluso sin datos.

## 8. Títulos y etiquetas

| Elemento | Texto |
|---|---|---|
| Pill de navegación (primera opción) | `Diagrama` |
| Pill de navegación (segunda opción) | `Gráficos` |
| Sub-tab x vs t | `Posición` |
| Sub-tab v vs t | `Velocidad` |
| Sub-tab a vs t | `Aceleración` |
| Placeholder (sin datos) | `Ingrese datos del diagrama` |

Las unidades se muestran en los ejes del gráfico, no en los títulos ni etiquetas de pestaña.

### 8.1 Renderizado de superíndices en ejes

El label del eje Y se construye pasando descripción y unidad por separado a `renderGraph` (`yLabelDesc`, `yUnit`). La unidad se procesa con `parseUnit` y se renderiza con `renderSegments`, generando `<tspan>` SVG para superíndices:

| Entrada | Output SVG |
|---------|-----------|
| `yLabelDesc='Aceleración'`, `yUnit='m/s^2'` | `<text ...>Aceleración (<tspan>m/s</tspan><tspan dy="-4" font-size="10">2</tspan>)</text>` |
| `yLabelDesc='Velocidad'`, `yUnit='m/s'` | `<text ...>Velocidad (<tspan>m/s</tspan>)</text>` |
| `yLabelDesc='Posición'`, `yUnit='m'` | `<text ...>Posición (<tspan>m</tspan>)</text>` |

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
| Visibilidad de sección | Siempre visible; cuando `disabled` muestra placeholder "Ingrese datos del diagrama" |
| Estilo de curva | Stroke `#2563eb`, stroke-width `2`, sin fill |
| Ejes | Con flechas, color `#000`, etiquetas en español |
| Font-size eje Y (título) | `14px` (etiqueta de eje Y se renderiza mediante `renderSegments` + `parseUnit` para superíndices) |
| Font-size eje X (título) | `14px` (texto plano: "Tiempo (s)") |
| Font-size ticks | `11px` (valores numéricos en ambos ejes) |
| API `renderGraph` | `(points, getY, yLabelDesc: string, yUnit: string)` — descripción y unidad separadas |
| Ticks de ejes | `computeNiceTicks()` — pasos "bonitos" (1, 2, 2.5, 5, 10 × 10^n); `0` se excluye del eje horizontal, siempre incluido en el eje vertical |
| Tamaño SVG | Fijo 400×400 (viewBox, no responsive) |
| Exportación | Botón "Exportar" único en el header de `DiagramSection`. Exporta el SVG activo (diagrama o gráfico según la pestaña seleccionada en el pill) |
| Caso a=0 | Mostrar igualmente (curvas lineales/constantes) |