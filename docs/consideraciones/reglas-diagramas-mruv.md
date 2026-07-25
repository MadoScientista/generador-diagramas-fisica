# Reglas de diagramas MRUA (Movimiento Rectilíneo Uniformemente Acelerado)

Basado en la arquitectura y estándares de la suite de generadores de diagramas de física (MRU v1 y v2).

---

## 1. Nuevas variables físicas e Inputs

El modelo de MRUA extiende el de MRU reemplazando la velocidad única constante $v$ por **velocidad inicial** ($v_i$), **velocidad final** ($v_f$) y **aceleración** ($a$).

### 1.1 Inputs del usuario

| Input | Descripción | Unidad por defecto | Unidades disponibles |
|-------|-------------|--------------------|----------------------|
| $x_i$ | Posición inicial | m | m, km |
| $x_f$ | Posición final | m | m, km |
| $t$ | Tiempo | s | s, min, h |
| $v_i$ | Velocidad inicial | m/s | m/s, km/h |
| $v_f$ | Velocidad final | m/s | m/s, km/h |
| $a$ | Aceleración | m/s² | m/s², km/h² |

### 1.2 Control de visualización de elementos

Se agregan/reemplazan los toggles en la tabla dentro del card **"Elementos del diagrama"**:

| Elemento | Etiqueta | Valor | Vector |
|----------|----------|-------|--------|
| $x_i$ | `xi` / `xi = 0 m` | Activo/Inactivo | — |
| $x_f$ | `xf` / `xf = 50 m` | Activo/Inactivo | — |
| $v_i$ | `vi` / `vi = 0 m/s` | Activo/Inactivo | Activo/Inactivo |
| $v_f$ | `vf` / `vf = 10 m/s` | Activo/Inactivo | Activo/Inactivo |
| $a$ | `a` / `a = 2 m/s²` | Activo/Inactivo | Activo/Inactivo |
| $t$ | `t` / `t = 5 s` | Activo/Inactivo | — |
| $\Delta x$ | `Δx` / `Δx = 50 m` | Activo/Inactivo | Activo/Inactivo |

- **Vector $v_i$**: Controla el vector de velocidad inicial en $x_i$.
- **Vector $v_f$**: Controla el vector de velocidad final en $x_f$.
- **Vector $a$**: Controla la representación de la aceleración (flecha indicadora de aceleración o desaceleración).

---

## 2. Vectores en el diagrama

### 2.1 Vectores de Velocidad ($v_i$ y $v_f$)
- **$v_i$**: Anclado al borde frontal del móvil en $x_i$.
- **$v_f$**: Anclado en la posición $x_f$.
- **Sentido**:
  - $v > 0$: Flecha hacia la derecha.
  - $v < 0$: Flecha hacia la izquierda.
  - $v = 0$: No se dibuja el vector.

### 2.2 Vector Aceleración ($a$)
- **Ubicación**: Situado en la parte superior del móvil/eje de movimiento.
- **Sentido**:
  - $a > 0$: Flecha apuntando a la derecha.
  - $a < 0$: Flecha apuntando a la izquierda (indica desaceleración o frenado si $v_i > 0$).
  - $a = 0$: Se comporta como MRU.

---

## 3. Formulación y Resolución Física (Ecuaciones de MRUA)

El motor cinemático resuelve el sistema en unidades SI (m, s, m/s, m/s²). Requiere al menos **5 valores conocidos** entre ($x_i, x_f, v_i, v_f, a, t$) para calcular los demás mediante las fórmulas fundamentales:

1. $v_f = v_i + a \cdot t$
2. $x_f = x_i + v_i \cdot t + \frac{1}{2} a \cdot t^2$
3. $v_f^2 = v_i^2 + 2 a \cdot (x_f - x_i)$
4. $x_f = x_i + \left(\frac{v_i + v_f}{2}\right) \cdot t$

### 3.1 Validaciones físicas
- **Tiempo negativo**: Se rechaza $t < 0$.
- **Consistencia**: Para 5 o más datos ingresados, se valida la concordancia con una tolerancia $|error| \le 0.001$.
- **Casos imposibles**: Si el cálculo genera raíces de números negativos (ej. $v_f^2 < 0$), lanza error de inconsistencia física.

---

## 4. Estructura del Módulo MRUA

Ubicación del módulo: `src/modules/mrua/`