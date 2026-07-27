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

- El cálculo de `τ*` (cambio de sentido de la velocidad: `τ* = -vi / a`) se realiza en
  `computeGraphData`, pero el resultado siempre se fuerza a `null`, de modo que no se
  renderiza ningún marcador en los tres gráficos.
- Esta decisión es reversible: si en el futuro se desea marcar `τ*`, basta con devolver el
  valor calculado en vez de `null` en `graph-helpers.ts`.

*(Puntos de interés adicionales — como extremos `(0, xi)`/`(t, xf)`, o cruces de a=0 en
movimiento por tramos — no están definidos en esta versión del documento y no deben agregarse
sin actualizarlo explícitamente.)*

## 6. Dimensiones del SVG

- Cada gráfico se renderiza en un SVG de **400px de ancho × 400px de alto**.
- Esta dimensión es fija para los tres gráficos (x-t, v-t, a-t) — no varía según el contenido
  o la densidad de datos.

## 7. Estructura de presentación

- Los tres gráficos (x-t, v-t, a-t) conviven dentro de **una sola tarjeta desplegable**
  (`CollapsibleCard` con título "Gráficos") usando un sistema de **pestañas** (tabs).
- Las pestañas muestran etiquetas cortas: "Posición", "Velocidad", "Aceleración".
- Solo un gráfico es visible a la vez; el activo por defecto es la primera pestaña
  ("Posición").
- Estado por defecto: **colapsada** (igual que otros `CollapsibleCards` del proyecto).

### Estado sin datos

- La tarjeta "Gráficos" **siempre es visible** en la página (no se condiciona su renderizado).
- Cuando no hay datos resueltos (`disabled=true`), el body de la tarjeta muestra la leyenda
  "Ingrese datos del diagrama" en gris claro / italic.
- Cuando los datos están disponibles, se muestran las pestañas con los gráficos y la tarjeta
  se puede desplegar normalmente.

## 8. Títulos y etiquetas

| Elemento | Texto |
|---|---|
| Tarjeta (CollapsibleCard) | `Gráficos` |
| Pestaña x vs t | `Posición` |
| Pestaña v vs t | `Velocidad` |
| Pestaña a vs t | `Aceleración` |
| Placeholder (sin datos) | `Ingrese datos del diagrama` |

Las unidades se muestran en los ejes del gráfico, no en los títulos ni etiquetas de pestaña.

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
| Estado por defecto de tarjeta | Colapsada (igual que otros CollapsibleCards del proyecto) |
| Ubicación en la página | Dentro de `.diagram-section`, debajo de `DiagramContainer` |
| Visibilidad de sección | Siempre visible; cuando `disabled` muestra placeholder "Ingrese datos del diagrama" |
| Estilo de curva | Stroke `#2563eb`, stroke-width `2`, sin fill |
| Ejes | Con flechas, color `#000`, etiquetas en español |
| Ticks de ejes | `computeNiceTicks()` — múltiplos de 5 exclusivamente; `0` se excluye del eje horizontal, siempre incluido en el eje vertical |
| Tamaño SVG | Fijo 400×400 (viewBox, no responsive) |
| Exportación | Cada gráfico con su propio botón "Exportar", posicionado absolute top-right del panel |
| Caso a=0 | Mostrar igualmente (curvas lineales/constantes) |