---
name: mru-physics-domain
description: Physics domain knowledge for Movimiento Rectilíneo Uniforme (MRU / uniform rectilinear motion) diagram generators. Use this skill whenever generating, validating, refactoring, or debugging code that computes xi (initial position), xf (final position), v (velocity), or t (time) from the other three MRU variables. Always consult this skill before writing solver functions, input validators, form logic, or diagram/plot rendering for MRU, even if the request only mentions "physics calculator", "movement diagram", "solve for velocity/time/position", or the specific variable names xi/xf/v/t. Do NOT use for MRUV (accelerated motion), projectile motion, or 2D/vector kinematics — those require a different equation set.
---

# MRU — Movimiento Rectilíneo Uniforme

Dominio físico: cuerpo que se desplaza en línea recta con **velocidad constante** (aceleración = 0). Existe una única ecuación gobernante; toda la lógica de cálculo se deriva de ella.

## 1. Modelo físico y variables

| Variable | Significado | Unidad SI | Signo | Rol en la ecuación |
|---|---|---|---|---|
| `xi` | Posición inicial | m | ℝ (cualquier signo) | término libre |
| `xf` | Posición final | m | ℝ (cualquier signo) | despejable |
| `v`  | Velocidad (constante) | m/s | ℝ (el signo indica sentido sobre el eje) | pendiente de la recta x-t |
| `t`  | Tiempo transcurrido | s | **ℝ>0 estricto (0 excluido)** | única variable con restricción de dominio físico |

**Ecuación gobernante (única fuente de verdad):**

```
xf = xi + v · t
```

Todo despeje, validación y mensaje de error del skill se deriva de esta ecuación. No hay ecuaciones alternativas en MRU (a diferencia de MRUV, que tendrá 3 ecuaciones — ver §8).

## 2. Matriz de resolución (Strategy por variable faltante)

La app recibe exactamente 3 de las 4 variables. Implementa esto como un `resolve(known: Partial<MRUInputs>): MRUResult`, con una estrategia por caso — nunca un único bloque de `if/else` anidado.

| Variable faltante | Fórmula | Precondición de cálculo | Si la precondición falla |
|---|---|---|---|
| `xf` | `xf = xi + v·t` | ninguna (siempre calculable) | — |
| `xi` | `xi = xf − v·t` | ninguna (siempre calculable) | — |
| `v`  | `v = (xf − xi) / t` | `t ≠ 0` | indeterminado si `t=0` y `xf≠xi` → **inconsistencia física**, no "división por cero" genérica |
| `t`  | `t = (xf − xi) / v` | `v ≠ 0` **y** `t` resultante `> 0` | si `v=0`: solo sería consistente cuando `xf = xi` (reposo), pero como `t=0` está excluido del dominio, este caso **no tiene solución válida** — nunca es "reposo instantáneo", es directamente `UNDERDETERMINED` (falta el dato, no hay reposo posible sin un `t>0` dado). Si `v≠0` pero el resultado da `t=0` (i.e. `xf=xi` con `v≠0`), es `PHYSICAL_CONTRADICTION`: un objeto con velocidad no nula no puede tener desplazamiento cero en un tiempo excluido de ser cero |

**Nota de implementación**: no trates el caso `t≠0`/`v≠0` como un simple guard de "evitar crash". Son ramas semánticamente distintas: una es error de input del usuario (contradicción física), la otra es indeterminación matemática legítima (infinitas soluciones). El mensaje de error debe diferenciarlas.

## 3. Reglas de validación (invariantes — evaluar en este orden)

Ejecuta estas validaciones **antes** de invocar cualquier resolver. El orden importa: cada regla asume que las anteriores ya pasaron.

1. **Cardinalidad de inputs**
   - Deben llegar **exactamente 3** valores numéricos válidos (no `null`/`NaN`/`undefined`/string vacío).
   - Si llegan las 4 → no es un "cálculo", es una **validación de consistencia**: sustituir en `xf = xi + v·t` y comparar con tolerancia epsilon (ver §5). Si no coincide, rechazar con mensaje explícito de qué variable ajustar, no recalcular silenciosamente ninguna.
   - Si llegan ≤2 → sistema subdeterminado, rechazar antes de intentar resolver.

2. **Dominio de `t` (la única variable con restricción física real) — regla única, sin ramas condicionales**
   - `t ≤ 0` → **siempre inválido**, sin excepción, tanto si llega como input directo como si resulta de un cálculo. `t=0` no representa "instante inicial" en este dominio: se rechaza igual que un negativo.
   - Consecuencia directa: el caso "objeto en reposo, `v=0`, `xi=xf`, falta `t`" **ya no tiene ninguna solución válida** (antes `t=0` la resolvía). Clasifícalo como `UNDERDETERMINED` — el sistema necesita que el usuario aporte un `t>0` explícito, no existe forma de derivarlo.
   - Consecuencia directa: si al despejar `t = (xf − xi) / v` el resultado da exactamente `0` (es decir, `xf = xi` con `v ≠ 0`), es **`PHYSICAL_CONTRADICTION`**, no un resultado válido: un cuerpo con velocidad distinta de cero no puede tener desplazamiento nulo bajo ningún `t` permitido en este dominio.
   - Implementación: valida `t > 0` con un único guard reutilizado tanto en el validador de input como en el post-procesamiento del resolver — no dupliques la condición en dos lugares del código.

3. **Caso `v = 0` (reposo)**
   - Si `v=0` es un input dado, entonces `xi` y `xf` (los que estén presentes) deben ser consistentes con "no hubo desplazamiento". Si te dan `v=0`, `xi` y `xf` con `xi≠xf`, es una **contradicción de input**, rechaza antes de intentar calcular `t`.

4. **Consistencia numérica con tolerancia (no comparar floats con `==`)**
   - Usa un epsilon relativo al orden de magnitud de los datos, no un epsilon fijo arbitrario. Ejemplo: `Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(a), Math.abs(b))`.
   - Epsilon sugerido por defecto: `1e-9` para aritmética en punto flotante de doble precisión con magnitudes típicas de m y s. Si tu UI permite unidades muy grandes (km, h), reconvierte a SI antes de comparar — nunca compares en unidades mixtas.

5. **Rango y tipo**
   - `xi`, `xf`, `v` son ℝ sin cota física — no impongas límites de dominio físico, pero sí límites de **UI/renderizado** (ver §7) para que el diagrama sea legible; esos límites van en la capa de presentación, no en la capa de validación física.
   - Rechaza `NaN`, `Infinity`, `-Infinity` en cualquier input o resultado antes de propagarlo al render del diagrama.

## 4. Tabla de casos inválidos (para tests y para mensajes de error)

| Input dado | Por qué es inválido | Categoría de error |
|---|---|---|
| `t = -5` | Tiempo negativo | `INVALID_DOMAIN` |
| `t = 0` (input directo, en cualquier combinación) | `t=0` está excluido del dominio — no representa un instante válido en este modelo | `INVALID_DOMAIN` |
| `v=0, xi=0, xf=10` (falta `t`) | Reposo con desplazamiento ≠ 0 → contradicción | `PHYSICAL_CONTRADICTION` |
| `xi=0, xf=10, t` calculado `=0` (falta `v`, con `xf≠xi`) | `v` resultaría infinita/indefinida para `t=0`, y `t=0` ya es inválido de por sí | `PHYSICAL_CONTRADICTION` |
| `xi=5, xf=5, v≠0` (falta `t`) | `t` calculado da exactamente `0` → fuera de dominio | `PHYSICAL_CONTRADICTION` |
| `xi=0, xf=0, v=0` (falta `t`) | Sin `v=0` y `t` excluido de ser `0`, no hay ningún `t` derivable — falta el dato | `UNDERDETERMINED` (no es "error de usuario", es "falta un dato más") |
| 4 valores dados, no satisfacen la ecuación dentro de epsilon | Overdetermined e inconsistente | `INCONSISTENT_OVERDETERMINED` |
| Solo 2 valores dados | Sistema subdeterminado | `INSUFFICIENT_INPUTS` |

Usa códigos de error como estos (no strings libres) para que el frontend pueda mapear a mensajes localizados sin parsear texto.

## 5. Precisión numérica

- Tipo de dato: `number` (double, IEEE 754) es suficiente para este dominio; no se requiere arbitrary precision.
- Redondea **solo en la capa de presentación** (ej. 2-4 decimales para mostrar en el diagrama). Nunca redondees antes de una comparación de consistencia o de un cálculo encadenado — el redondeo prematuro genera falsos negativos en la validación de epsilon.
- Si conviertes unidades (km↔m, h↔s) hazlo en una única función pura de normalización antes de que los datos entren al resolver; el resolver siempre opera en SI.

## 6. Implicaciones para el diagrama (x-t y v-t)

- **Gráfico posición-tiempo (x-t)**: recta con pendiente `v`, ordenada al origen `xi`, que pasa por `(t, xf)`. Si `v=0`, es una recta horizontal — trátalo como caso de renderizado explícito, no dejes que el cálculo de pendiente `Δx/Δt` con `Δt` pequeño produzca artefactos visuales.
- **Gráfico velocidad-tiempo (v-t)**: recta horizontal en `y=v` desde `t=0` hasta `t` — el área bajo la curva debe ser igual a `xf - xi`, útil como test de consistencia visual/QA.
- **Escalado de ejes**: al ser `xi`, `xf`, `v` no acotados, calcula el rango del eje dinámicamente a partir de `min/max` de los valores conocidos + margen (ej. 10%), nunca hardcodees rangos fijos en el componente de render.

## 7. Estrategia de testing sugerida

Property-based / table-driven, no solo casos felices:

- **Round-trip**: para cualquier `(xi, v, t)` válido con `t` generado **estrictamente en `(0, ∞)`** (excluir 0 del generador de datos de prueba) → calcular `xf` → resolver de vuelta cada una de las 4 variables usando las otras 3 → debe recuperar el valor original dentro de epsilon. Este único test cubre las 4 fórmulas del §2 simultáneamente.
- **Rechazo de `t ≤ 0`** como input directo (incluir explícitamente el caso límite `t=0`, no solo negativos) y como resultado calculado.
- **Rechazo de `t=0` calculado**: `xi=5, xf=5, v=3` (falta `t`) debe devolver `PHYSICAL_CONTRADICTION`, no `0`.
- **Contradicción `v=0` + `xi≠xf`**.
- **Indeterminación `v=0, xi=xf`, falta `t`** → debe responder `UNDERDETERMINED`, no `0`/`Infinity`/`NaN`.
- **Consistencia con 4 valores**: casos consistentes (pasan) e inconsistentes (fallan) cerca del umbral de epsilon, para verificar que la tolerancia no sea ni muy laxa ni muy estricta.
- **Fuzzing numérico**: valores muy grandes (`1e12`) y muy pequeños (`1e-9`) para detectar pérdida de precisión en la comparación de epsilon relativo.

## 8. Extensión futura (no implementar aún, solo referencia)

MRUV añade aceleración `a` y una tercera fórmula (`xf = xi + v·t + ½at²`, `vf² = vi² + 2a·Δx`, `vf = vi + a·t`), con 6 variables posibles y más combinaciones de "3 conocidas → resolver el resto". Cuando construyas ese skill, sepáralo en un archivo distinto (`mruv-physics-domain`) en vez de extender este — los invariantes de `t` y las categorías de error de este documento son reutilizables, pero la matriz de resolución de MRUV es sustancialmente más grande (sistema de 2 ecuaciones con más grados de libertad) y merece su propio documento para no romper el límite de progressive disclosure de este skill.