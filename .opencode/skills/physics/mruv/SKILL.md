---
name: mruv-physics-domain
description: Physics domain knowledge for Movimiento Rectilíneo Uniformemente Variado (MRUV / uniformly accelerated rectilinear motion): governing equations, minimum-cardinality resolution rules, sign-ambiguity handling, and validation invariants for xi (initial position), xf (final position), vi (initial velocity), vf (final velocity), a (acceleration), and t (time). Use this skill whenever generating, validating, refactoring, or debugging code that computes any of these variables from the others, regardless of the consuming application — calculators, simulations, educational tools, diagram generators, physics engines, or backend services. Always consult before writing solver functions, input validators, or cardinality logic for MRUV, even if the request only mentions "accelerated motion", "aceleración constante", or the specific variable names xi/xf/vi/vf/a/t. This skill is purely domain knowledge: it contains no rendering, UI, or presentation logic, and is self-contained — it does not assume or require any other physics skill to be loaded. Do NOT use for MRU (constant velocity), projectile motion, or 2D/vector kinematics — those require different equation sets and different cardinality rules.
---

# MRUV — Movimiento Rectilíneo Uniformemente Variado

Dominio físico: cuerpo que se desplaza en línea recta con **aceleración constante** (≠ 0 en el caso general; `a=0` es un caso degenerado — ver §6.6). A diferencia de un modelo de una sola ecuación, MRUV requiere razonar sobre un **sistema de 4 ecuaciones con 5 cantidades físicas independientes**, más 2 variables de posición que solo importan por su diferencia.

## 1. Variables

| Variable | Significado | Unidad SI | Signo | Cómo participa en el sistema |
|---|---|---|---|---|
| `xi` | Posición inicial | m | ℝ | solo a través de `Δx = xf − xi` |
| `xf` | Posición final | m | ℝ | solo a través de `Δx = xf − xi` |
| `vi` | Velocidad inicial | m/s | ℝ | variable física plena (parte del sistema de ecuaciones) |
| `vf` | Velocidad final | m/s | ℝ | variable física plena |
| `a`  | Aceleración (constante) | m/s² | ℝ (positivo = acelera en sentido +, negativo = frena o acelera en sentido −) | variable física plena |
| `t`  | Tiempo transcurrido | s | **ℝ>0 estricto (0 excluido)** | variable física plena, única con restricción de dominio |

**Cantidad derivada clave**: `Δx = xf − xi` (desplazamiento neto). No es un input directo del dominio (no forma parte de las 6 variables primarias), pero es la unidad de trabajo real del sistema de ecuaciones — trátala como una quinta cantidad física en la lógica de resolución, y solo al final "despliega" el resultado hacia `xi`/`xf` individuales (§3).

## 2. Ecuaciones gobernantes

Cuatro ecuaciones, cada una **omite exactamente una** de las cinco cantidades físicas `{vi, vf, a, t, Δx}`. Esto no es redundancia — cada una es la herramienta correcta a usar cuando esa variable omitida es justamente la que falta.

| # | Ecuación | Variable que NO aparece |
|---|---|---|
| E1 | `vf = vi + a·t` | `Δx` |
| E2 | `Δx = vi·t + ½·a·t²` | `vf` |
| E3 | `vf² = vi² + 2·a·Δx` | `t` |
| E4 | `Δx = ((vi + vf) / 2) · t` | `a` |

Solo 2 de estas 4 son independientes (E3 y E4 se derivan combinando E1 y E2), pero **documenta y usa las 4** en el código: elegir la ecuación que ya excluye la variable que te falta evita despejar por variables desconocidas en cascada y reduce superficie de error.

## 3. Insight arquitectónico crítico: por qué "N−1 conocidas" NO aplica aquí

En un modelo de una sola ecuación (una recta), dar 3 de 4 variables siempre determina la 4ta. Acá **no** es así, por dos razones combinadas:

1. **`xi` y `xf` no son variables físicas independientes del sistema** — solo importa su diferencia `Δx`. Si conoces `xi` pero no `xf` (o viceversa), sigues sin conocer `Δx`.
2. **El sistema de 5 cantidades `{vi, vf, a, t, Δx}` necesita 3 conocidas para derivar las otras 2** (no 1 de 4, sino 2 de 5 — ver matriz completa en §4).

Consecuencia directa para cualquier validador de cardinalidad que consuma este dominio:

> Para resolver el problema completo (obtener los 6 valores `xi, xf, vi, vf, a, t`) necesitas, como mínimo, **4 inputs crudos**: al menos **uno** de `{xi, xf}` (para anclar el sistema de referencia) **más 3** de `{vi, vf, a, t}` (para resolver `Δx` y la cantidad restante vía la matriz de §4). Si das ambos `xi` y `xf`, `Δx` queda fijo automáticamente y solo necesitas **2 más** de `{vi, vf, a, t}`.

Esto significa que un validador de cardinalidad para este dominio no puede ser "cuenta cuántos campos llegaron y exige exactamente N" — tiene que verificar dos condiciones independientes:

- **Condición de anclaje**: ¿hay al menos un valor de posición (`xi` o `xf`), o los dos?
- **Condición de sistema**: de las cantidades `{vi, vf, a, t, Δx}` (con `Δx` conocido solo si `xi` y `xf` están ambos dados), ¿hay al menos 3 conocidas?

Tabla resumen de cardinalidad mínima:

| Posición dada | `{vi,vf,a,t}` conocidas necesarias | Total inputs crudos mínimos |
|---|---|---|
| Solo `xi` (o solo `xf`) | 3 de 4 | 4 |
| Ambas `xi` y `xf` | 2 de 4 (`Δx` ya cuenta como la 3ra del sistema) | 4 |
| Ninguna | — | **nunca alcanza**: puedes resolver `Δx` pero no puedes derivar `xi` ni `xf` individuales sin al menos un ancla — clasifica como `POSITION_UNANCHORED` aunque el resto del sistema esté completo |

## 4. Matriz de resolución (3 conocidas de `{vi, vf, a, t, Δx}` → 2 incógnitas)

Existen `C(5,3) = 10` combinaciones. Impleméntalas como una tabla de estrategias (Strategy Pattern) indexada por el conjunto de claves conocidas, no como un árbol de `if` anidado — con 10 casos un árbol de decisión se vuelve inmantenible y propenso a bugs de rama faltante.

| Conocidas | Incógnitas | Orden de resolución | Precondiciones | Notas |
|---|---|---|---|---|
| `vi, vf, a` | `t, Δx` | `t=(vf−vi)/a` (E1) → `Δx=((vi+vf)/2)·t` (E4) | `a≠0` (si `a=0`: válido solo si `vi=vf`, y entonces `t` es indeterminado → `UNDERDETERMINED`; si `a=0` y `vi≠vf` → `PHYSICAL_CONTRADICTION`) | — |
| `vi, vf, t` | `a, Δx` | `a=(vf−vi)/t` (E1) → `Δx=((vi+vf)/2)·t` (E4) | `t>0` ya garantizado por dominio (§1) | ninguna división por variable insegura |
| `vi, vf, Δx` | `a, t` | `t=2Δx/(vi+vf)` (E4) → `a=(vf−vi)/t` (E1) | `vi+vf ≠ 0`. Si `vi+vf=0`: la velocidad promedio es 0, por lo que físicamente `Δx` **debe** ser 0 también (teorema de velocidad media, válido siempre en MRUV); si `Δx=0` → `t` indeterminado (`UNDERDETERMINED`); si `Δx≠0` → `PHYSICAL_CONTRADICTION` | caso `vi+vf=0` típico de "objeto que se detiene y regresa exactamente" |
| `vi, a, t` | `vf, Δx` | `vf=vi+a·t` (E1) → `Δx=vi·t+½at²` (E2) | ninguna | caso más simple, sin ambigüedad |
| `vi, a, Δx` | `vf, t` | `vf=±√(vi²+2aΔx)` (E3) → `t=(vf−vi)/a` (E1) | discriminante `vi²+2aΔx ≥ 0` (si no, `NO_REAL_SOLUTION`); `a≠0` para despejar `t` | **⚠ ambigüedad de signo — ver §5** |
| `vi, t, Δx` | `vf, a` | `a=2(Δx−vi·t)/t²` (E2) → `vf=vi+a·t` (E1) | `t>0` ya garantizado | — |
| `vf, a, t` | `vi, Δx` | `vi=vf−a·t` (E1) → `Δx=((vi+vf)/2)·t` (E4) | ninguna | — |
| `vf, a, Δx` | `vi, t` | `vi=±√(vf²−2aΔx)` (E3) → `t=(vf−vi)/a` (E1) | discriminante `vf²−2aΔx ≥ 0`; `a≠0` | **⚠ ambigüedad de signo — ver §5** |
| `vf, t, Δx` | `vi, a` | `vi=2Δx/t−vf` (E4) → `a=(vf−vi)/t` (E1) | `t>0` ya garantizado | — |
| `a, t, Δx` | `vi, vf` | `vi=(Δx−½at²)/t` (E2) → `vf=vi+a·t` (E1) | `t>0` ya garantizado | — |

Una vez resuelto `Δx`: si solo tenías `xi`, entonces `xf = xi + Δx`; si solo tenías `xf`, entonces `xi = xf − Δx`; si tenías ambos, ya estaba resuelto y este paso es una validación de consistencia, no un cálculo (compara con epsilon, §7).

## 5. Ambigüedad de signo — decisión de arquitectura obligatoria

Las combinaciones `{vi, a, Δx}` y `{vf, a, Δx}` usan `E3` (`vf² = vi² + 2aΔx`), que **pierde el signo** al derivarse de eliminar `t` entre E1 y E2. Físicamente esto es correcto: en una trayectoria rectilínea con aceleración constante que se opone a la velocidad inicial, el objeto puede desacelerar, detenerse y **retroceder por la misma línea**, pasando por el mismo `Δx` en dos instantes distintos con velocidades de signo opuesto.

**No resuelvas esto con una heurística implícita** (ej. "siempre tomo el signo positivo") porque produce resultados físicamente incorrectos en escenarios de frenado/reversa sin que el validador lo detecte. Opciones válidas a nivel de dominio, en orden de preferencia:

1. **Preferido**: cuando el caso resuelto cae en una de estas dos combinaciones, exige como parte del contrato de entrada un dato adicional de contexto — ej. un flag booleano "¿el objeto ya invirtió su sentido de marcha antes de este punto?" — y úsalo para elegir el signo (`+` si aún no invierte, `−` si ya invirtió).
2. **Alternativa**: calcula ambas soluciones (`vf`/`vi` con `+` y con `−`), resuelve el `t` correspondiente a cada una, y **devuelve ambas** como resultado del dominio para que la capa consumidora decida cuál corresponde a su escenario — no se descarta información en el dominio, se delega la decisión hacia afuera.
3. **Evitar**: adivinar el signo basándose en el signo de `a` o `vi` sin más contexto — funciona en el caso común (sin reversa) pero falla silenciosamente en el caso de reversa, que es precisamente el escenario donde la ambigüedad existe.

Clasifica el caso `discriminante < 0` como `NO_REAL_SOLUTION` (distinto de `PHYSICAL_CONTRADICTION`): significa que no existe ningún `a` real compatible con los demás datos para alcanzar ese `Δx`, no que los datos se contradigan entre sí de forma directa.

## 6. Reglas de validación (evaluar en este orden)

1. **Condición de anclaje** (§3): sin al menos un valor de posición, clasifica `POSITION_UNANCHORED` aunque `{vi,vf,a,t,Δx}` esté completo.
2. **Condición de sistema** (§3): menos de 3 conocidas entre `{vi, vf, a, t, Δx}` → `INSUFFICIENT_INPUTS`.
3. **Dominio de `t`**: `t ≤ 0` siempre inválido — como input directo y como resultado calculado en cualquier fila de la matriz de §4. Mismo criterio estricto que en el dominio de velocidad constante: `t=0` no es "instante inicial" válido en este modelo, se rechaza igual que un negativo.
4. **Discriminante negativo** en combinaciones `{vi,a,Δx}` / `{vf,a,Δx}` → `NO_REAL_SOLUTION` (§5).
5. **Denominadores**: `a=0` en fórmulas que dividen por `a` (filas 1, 5, 8 de §4) y `vi+vf=0` en la fila 3 — cada uno con su propio submanejo de contradicción/indeterminación documentado en la tabla de §4, no un guard genérico de "división por cero".
6. **Caso degenerado `a=0` como input directo**: es físicamente válido (el objeto se mueve a velocidad constante), pero **este skill no cubre sus fórmulas de forma segura** porque varias filas de la matriz dividen por `a`. Dos estrategias válidas: (a) delegar ese caso a un dominio de velocidad constante (MRU) si el sistema consumidor lo tiene disponible, o (b) tratarlo como un caso especial explícito dentro del propio dominio MRUV: con `a=0`, `E1` da `vf=vi` (deben coincidir si ambas se dan) y `E2` se reduce a `Δx=vi·t`, sin necesidad de las filas que dividen por `a`. Si se implementa (b), debe ser una rama de código explícita, no una reutilización silenciosa de las fórmulas generales.
7. **Consistencia si llegan más inputs de los estrictamente necesarios** (overdetermined): sustituye los valores dados en las 4 ecuaciones de §2 y verifica que todas se satisfagan dentro de epsilon relativo (§7). Si alguna falla → `INCONSISTENT_OVERDETERMINED`, indicando cuál ecuación no cierra (útil para el mensaje de error).
8. **Rechaza `NaN`/`Infinity`** en cualquier input o resultado antes de devolverlo como salida del dominio.

## 7. Precisión numérica

Mismas convenciones recomendadas que en cualquier dominio de cinemática de este tipo de app:

- Tipo `number` (double IEEE 754) es suficiente; no se requiere precisión arbitraria.
- Epsilon relativo, no absoluto fijo: `|a − b| ≤ epsilon · max(1, |a|, |b|)`, con `epsilon = 1e-9` como default para SI.
- Redondea solo en la capa de presentación; nunca antes de una comparación de consistencia o de un cálculo encadenado (los cálculos de MRUV son más largos que MRU — 2 pasos por combinación — así que el error de redondeo prematuro se acumula más rápido).
- Todas las conversiones de unidad (km↔m, h↔s) se hacen en una única función pura de normalización antes de entrar al resolver; el resolver siempre opera en SI.

## 8. Estrategia de testing

- **Round-trip por cada una de las 10 filas de la matriz (§4)**: genera `(vi, vf, a, t)` válidos con `t` estrictamente en `(0, ∞)`, deriva `Δx`, y para cada combinación de 3 conocidas de esa fila, verifica que el resolver recupera las 2 incógnitas dentro de epsilon. Esto son 10 suites de test, no una — cada fila tiene su propia fórmula y sus propias precondiciones.
- **Ambigüedad de signo (§5)**: casos construidos deliberadamente donde el objeto invierte sentido (`vi` y `a` de signos opuestos, con `Δx` alcanzable en dos tiempos) — verifica que el sistema no elige silenciosamente un signo sin la información de contexto requerida.
- **Discriminante negativo**: `vi, a, Δx` tales que `vi² + 2aΔx < 0` → debe responder `NO_REAL_SOLUTION`, no `NaN`.
- **Anclaje de posición**: ni `xi` ni `xf` dados, con `{vi,vf,a,t}` completos → `POSITION_UNANCHORED`, nunca debe "inventar" una posición.
- **Degenerado `a=0`**: con `vi≠vf` dados junto con `a=0` → `PHYSICAL_CONTRADICTION`; con `vi=vf` y `a=0` → verifica la rama explícita del §6.6, no las fórmulas generales que dividen por `a`.
- **`vi+vf=0`**: verifica ambas ramas (`Δx=0` → `UNDERDETERMINED`; `Δx≠0` → `PHYSICAL_CONTRADICTION`).
- **Rechazo de `t≤0`** como input directo y como resultado calculado, igual que en el dominio de velocidad constante.
- **Consistencia overdetermined**: casos con más inputs de los mínimos necesarios, unos consistentes (pasan) y otros inconsistentes cerca del umbral de epsilon (fallan), para calibrar que la tolerancia no sea ni muy laxa ni muy estricta.

## 9. Categorías de error (para que la capa consumidora mapee mensajes sin parsear texto)

| Código | Cuándo se dispara |
|---|---|
| `INVALID_DOMAIN` | `t ≤ 0` como input directo |
| `INSUFFICIENT_INPUTS` | menos de 3 conocidas entre `{vi,vf,a,t,Δx}` |
| `POSITION_UNANCHORED` | sistema `{vi,vf,a,t,Δx}` resoluble pero ni `xi` ni `xf` fueron dados |
| `PHYSICAL_CONTRADICTION` | resultado calculado viola una restricción física (`t≤0` calculado, `a=0` con `vi≠vf`, `vi+vf=0` con `Δx≠0`) |
| `UNDERDETERMINED` | los datos son consistentes pero no alcanzan para una solución única (ej. `a=0, vi=vf`, o `vi+vf=0, Δx=0`) |
| `NO_REAL_SOLUTION` | discriminante negativo en E3 |
| `AMBIGUOUS_SIGN` | combinación `{vi,a,Δx}` o `{vf,a,Δx}` sin dato de contexto adicional para desambiguar signo |
| `INCONSISTENT_OVERDETERMINED` | más inputs de los necesarios y no satisfacen las ecuaciones dentro de epsilon |

## 10. Fuera de alcance de este skill

- Movimiento en 2D/3D o proyectil (requiere vectores y componentes independientes por eje).
- Aceleración no constante (requeriría cálculo integral/diferencial, no álgebra cerrada).
- Sistemas de referencia no inerciales.

Si necesitas alguno de estos, créalos como skills independientes con su propio sistema de ecuaciones — no extiendas este documento, ya está en el límite razonable de tamaño para un skill de un solo dominio.