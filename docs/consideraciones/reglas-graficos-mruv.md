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
  los muestra simultáneamente, aunque cada uno vive en su propia tarjeta desplegable (§7).

## 4. Unidades

- Por defecto, todos los gráficos se muestran en **unidades SI**: metros (m) para posición,
  metros por segundo (m/s) para velocidad, metros por segundo al cuadrado (m/s²) para
  aceleración, segundos (s) para tiempo.
- Cualquier conversión de unidad de entrada/salida (si la app la ofrece) ocurre **antes** de
  llegar a esta capa de graficación — igual que en el skill de dominio (§7 de
  `mruv-physics-domain`: las conversiones se hacen en una función pura de normalización antes
  del resolver). Este documento no define lógica de conversión.

## 5. Puntos de interés a marcar

**Único punto de interés definido:** cambio de sentido de la velocidad.

- Ocurre en el instante `τ* = -vi / a` (derivado de E1 del skill de dominio: `v(τ*) = 0`).
- Se marca **solo si** `τ* ∈ (0, t)` — es decir, el cambio de sentido ocurre estrictamente
  dentro del intervalo graficado. Si `τ* ≤ 0`, `τ* ≥ t`, o `a = 0` (no hay cambio de sentido
  posible), no se marca ningún punto.
- El punto se marca en **los tres gráficos** en el mismo instante `τ*`:
  - En x-t: es el vértice de la parábola (`x(τ*)`).
  - En v-t: es el cruce por cero (`v(τ*) = 0`).
  - En a-t: no cambia la forma de la curva (a es constante), pero se marca igualmente el
    instante `τ*` como referencia cruzada con los otros dos gráficos.
- Si el resultado del skill de dominio llegó marcado como `AMBIGUOUS_SIGN` (§5 de
  `mruv-physics-domain`) y aún no fue resuelto por el flag de contexto, **no se grafica** —
  ese caso debe resolverse en la capa de dominio antes de llegar aquí.

*(Puntos de interés adicionales — como extremos `(0, xi)`/`(t, xf)`, o cruces de a=0 en
movimiento por tramos — no están definidos en esta versión del documento y no deben agregarse
sin actualizarlo explícitamente.)*

## 6. Dimensiones del SVG

- Cada gráfico se renderiza en un SVG de **400px de ancho × 400px de alto**.
- Esta dimensión es fija para los tres gráficos (x-t, v-t, a-t) — no varía según el contenido
  o la densidad de datos.

## 7. Estructura de presentación

- Cada gráfico vive dentro de **su propia tarjeta desplegable** (collapsible/accordion) —
  un total de 3 tarjetas independientes, una por variable graficada.
- Las tarjetas no están anidadas entre sí ni comparten contenedor visual más allá del layout
  general de la página.
- Estado por defecto (expandida/colapsada al cargar) no está definido en esta versión — debe
  decidirse explícitamente si la app lo requiere.

## 8. Títulos de las tarjetas

| Gráfico | Título exacto |
|---|---|
| x vs t | `Posición en función del tiempo` |
| v vs t | `Velocidad en función del tiempo` |
| a vs t | `Aceleración en función del tiempo` |

Los títulos se usan tal cual, sin abreviar variables (`x`, `v`, `a`) ni agregar unidades en el
título mismo — las unidades se muestran en los ejes del gráfico, no en el título de la tarjeta.

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
| τ* renderizado | Círculo relleno + línea vertical punteada + label `τ* = {valor} s` |
| Estado por defecto de tarjetas | Colapsadas (igual que otros CollapsibleCards del proyecto) |
| Ubicación en la página | Nueva `section` separada debajo de `.diagram-section` |
| Visibilidad de sección | Solo cuando `result.type === 'success'` con `resolvedValues` |
| Estilo de curva | Stroke `#2563eb`, stroke-width `2`, sin fill |
| Ejes | Con flechas, etiquetas en español |
| Tamaño SVG | Fijo 400×400 (viewBox, no responsive) |
| Exportación | Cada gráfico con su propio botón "Exportar" |
| Caso a=0 | Mostrar igualmente (curvas lineales/constantes) |