# Reglas de UI — Generador MRUV

> Las reglas de dominio físico (ecuaciones, validación, resolución, unidades, categorías de error) están en `.opencode/skills/physics/mruv/SKILL.md`.

---

## 1. Elementos del diagrama

Todo diagrama MRUV contiene:

- **Eje X principal**: línea horizontal (sin punta de flecha ni etiqueta "x")
- **Origen**: marcado con un tick vertical en el eje, etiquetado como $x = 0$
- **Móvil (cuadrado)**: representa la posición en el eje. Puede aparecer en $x_i$, $x_f$, o ambos. Sin ojo ni punto interior
- **Tick de $x_i$**: marca en el eje alineada con el móvil (solo cuando $x_i \neq 0$)
- **Tick de $x_f$**: marca en el eje para la posición final
- **Vector velocidad inicial ($v_i$)**: flecha desde el borde frontal del móvil en $x_i$, centrada verticalmente en la caja
- **Vector velocidad final ($v_f$)**: flecha centrada sobre el móvil en $x_f$, arriba de este
- **Vector aceleración ($a$)**: flecha centrada horizontalmente entre $x_i$ y $x_f$, debajo de la etiqueta $a$
- **Flecha de desplazamiento ($\Delta x$)**: eje secundario debajo del principal, desde $x_i$ hasta $x_f$
- **Etiquetas**: $x = 0$, $x_i$, $x_f$, $v_i$, $v_f$, $a$, $t$, $\Delta x$

---

## 2. Control de visualización de elementos

> El patrón general de la tabla 5 columnas (Etiqueta / Valor / Vector / Móvil) está en AGENTS.md > UI Conventions.

Toggles en la tabla dentro del card **"Elementos del diagrama"**:

| Elemento | Etiqueta | Valor | Vector | Móvil |
|----------|----------|-------|--------|-------|
| $x_i$ | `xi` / `xi = 0 m` | Activo/Inactivo | — | **Activo/Inactivo** |
| $x_f$ | `xf` / `xf = 50 m` | Activo/Inactivo | — | **Activo/Inactivo** |
| $v_i$ | `vi` / `vi = 0 m/s` | Activo/Inactivo | Activo/Inactivo | — |
| $v_f$ | `vf` / `vf = 10 m/s` | Activo/Inactivo | Activo/Inactivo | — |
| $a$ | `a` / `a = 2 m/s²` | Activo/Inactivo | Activo/Inactivo | — |
| $t$ | `t` / `5 s` | Activo/Inactivo | — | — |
| $\Delta x$ | `Δx` / `Δx = 50 m` | Activo/Inactivo | Activo/Inactivo | — |

Reglas de visibilidad:

- El checkbox **Valor** se deshabilita automáticamente si **Etiqueta** está destildado
- **Móvil $x_i$**: controla si se muestra el personaje en la posición inicial. Si está desactivado, no se dibuja el cuadrado/personaje en $x_i$
- **Móvil $x_f$**: controla si se muestra el personaje en la posición final. Si está activado, se dibuja un segundo cuadrado/personaje en $x_f$
- **Vector $v_i$**: controla el vector de velocidad inicial en $x_i$. La visibilidad final es AND entre el toggle y $v_i \neq 0$
- **Vector $v_f$**: controla el vector de velocidad final en $x_f$. La visibilidad final es AND entre el toggle, $v_f \neq 0$, y que el **móvil $x_f$ esté visible**
- **Vector $a$**: controla la representación de la aceleración. La visibilidad final es AND entre el toggle y $a \neq 0$
- **Vector $\Delta x$**: controla la flecha de desplazamiento. La visibilidad final es AND entre el toggle y $\Delta x \neq 0$

### 2.1 Dependencias del móvil $x_f$

Cuando el **Móvil $x_f$** está desactivado:

- El **vector $v_f$** se oculta automáticamente
- La **etiqueta $v_f$** se oculta automáticamente
- Los checkboxes de $v_f$ (Etiqueta, Valor, Vector) se **deshabilitan** visualmente

Al reactivar el móvil $x_f$, el vector y la etiqueta $v_f$ reaparecen según el estado de sus toggles.

---

## 3. Posiciones

### 3.1 El móvil representa las posiciones

El cuadrado blanco con borde negro representa una posición en el eje. Puede aparecer en $x_i$, $x_f$, o ambos, controlado por la columna "Móvil" en la tabla de visibilidad.

### 3.2 Ticks en el eje

Existen hasta tres marcas (ticks) verticales sobre el eje:

| Tick | Propósito | Visible cuando... |
|------|-----------|-------------------|
| $x = 0$ | Origen | Siempre |
| $x_i$ | Posición inicial | Controlado por toggle de visibilidad |
| $x_f$ | Posición final | Controlado por toggle de visibilidad |

Notas:
- La parte superior de los ticks coincide con el eje x principal
- Si $x_i = 0$, el tick de $x_i$ coincide con el origen
- Si $x_f = x_i$ (desplazamiento nulo), el tick de $x_f$ coincide con $x_i$

### 3.3 Escalado del Layout

El origen NO está fijo en el centro. Se reubica según el rango de datos:

- $x_i > 0$ y $x_f > 0$ → origen a la **izquierda**
- $x_i < 0$ y $x_f < 0$ → origen a la **derecha**
- $x_i$ y $x_f$ tienen signos distintos → origen **entre ambos**. No necesariamente tiene que estar al centro entre ambos, se debe considerar la distancia según los valores de $x_i$ y $x_f$

Los ticks de posición se restringen a una banda de `USABLE_WIDTH - 2 * POSITION_PADDING` (con `POSITION_PADDING = 40px`) centrada dentro del eje, dejando aire visual en los extremos.

### 3.4 Gap mínimo entre posiciones

Para evitar que ticks de posiciones muy cercanas aparezcan superpuestos en pantalla, el layout engine impone una **distancia mínima de 50px** entre posiciones físicas distintas (origen, $x_i$, $x_f$).

- Se prueba primero un mapeo lineal; si todos los gaps entre adyacentes son ≥ 50px, se usa directamente
- Si algún gap es menor, se redistribuye: cada par adyacente recibe al menos 50px, y el espacio restante se asigna proporcionalmente a sus diferencias físicas
- Posiciones idénticas en valor físico (ej. origen y $x_i = 0$) ocupan el mismo punto en pantalla

### 3.5 Diagrama base (sin inputs)

Cuando hay menos de 4 campos numéricos llenos, se renderiza solo:
- Eje X principal
- Origen con etiqueta $x = 0$
- Caja centrada en el origen, sin orientación (mirada neutra)

---

## 4. Vectores en el diagrama

### 4.1 Vectores de Velocidad ($v_i$ y $v_f$)

- **$v_i$**: anclado al **borde frontal** del móvil en $x_i$. $v_i > 0$ → flecha desde el borde derecho hacia la derecha. $v_i < 0$ → flecha desde el borde izquierdo hacia la izquierda. $v_i = 0$ → no se dibuja.
- **$v_f$**: centrado sobre el móvil en $x_f$. La flecha se centra horizontalmente en la posición del móvil. $v_f > 0$ → flecha hacia la derecha. $v_f < 0$ → flecha hacia la izquierda. $v_f = 0$ o móvil $x_f$ oculto → no se dibuja.
- La línea termina en la **base del triángulo**, no en la punta.
- Longitud fija de 80px (no escala con la magnitud de $v$).

### 4.2 Vector Aceleración ($a$)

- **Ubicación**: centrado horizontalmente entre $x_i$ y $x_f$, debajo de la etiqueta $a$ y sobre el eje principal.
- **Sentido**:
  - $a > 0$: flecha apuntando a la derecha
  - $a < 0$: flecha apuntando a la izquierda
  - $a = 0$: no se dibuja
- La línea termina en la base del triángulo (misma lógica que los vectores velocidad).

---

## 5. Representación del móvil

- Forma: cuadrado de **50×50** unidades
- Fondo: blanco, borde negro, grosor 2px
- Sin ojo ni punto interior
- Puede haber hasta **2 móviles** visibles simultáneamente (uno en $x_i$ y otro en $x_f$)
- Orientación (mirada): cada móvil mira en la dirección de su vector de velocidad correspondiente
  - Móvil en $x_i$: mira según el signo de $v_i$
    - $v_i > 0$: mira hacia la derecha
    - $v_i < 0$: mira hacia la izquierda
    - $v_i = 0$ o diagrama base: mirada neutra (sin dirección)
  - Móvil en $x_f$: mira según el signo de $v_f$
    - $v_f > 0$: mira hacia la derecha
    - $v_f < 0$: mira hacia la izquierda
    - $v_f = 0$: mirada neutra
- Tipo de personaje configurable: cuadrado, persona, bicicleta, automóvil (mismo patrón que MRU v2)

---

## 6. Etiquetas

### 6.1 Posiciones de las etiquetas

> El formato (`{id} = {valor} {unidad}`), estilo (Inter/Roboto, sin itálica) y precisión decimal (máx 3 decimales) están en AGENTS.md > UI Conventions / Conventions.

| Texto | Posición |
|-------|----------|
| $x = 0$ | Debajo del tick del origen. Es la única sin valor ni unidad |
| $x_i$ | **Sobre el cuadrado** cuando está cerca del origen (< 50px pantalla); debajo del tick en caso contrario. Se etiqueta como **xi** (no x₀) |
| $x_f$ | **Sobre el cuadrado** cuando está cerca del origen (< 50px), subiendo 18px extra si $x_i$ también está elevado; debajo del tick en caso contrario. Se etiqueta como **xf** |
| $v_i$ | Encima del vector velocidad inicial, centrado |
| $v_f$ | Centrada sobre el vector $v_f$, que a su vez está centrado sobre el móvil en $x_f$ |
| $t$ | En el punto medio horizontal entre $x_i$ y $x_f$, **sobre** la etiqueta $a$ |
| $a$ | En el punto medio horizontal entre $x_i$ y $x_f$, **debajo** de $t$ y **sobre** el vector aceleración |
| $\Delta x$ | En el punto medio entre $x_i$ y $x_f$, debajo de la flecha de desplazamiento |

La pila vertical sobre el eje (de arriba hacia abajo) es: $t$ → $a$ → vector $a$ → eje.

Los vectores de velocidad $v_i$ se posicionan a la altura del centro del móvil, mientras que $v_f$ y su etiqueta se posicionan sobre el móvil en $x_f$.

### 6.2 Control de visibilidad

- **Etiqueta**: si está desactivado, el nodo completo se oculta del SVG
- **Valor**: si está activado, la etiqueta muestra `{id} = {valor} {unidad}`; si no, solo `{id}`. Solo disponible si Etiqueta está activo
- **Vector**: controla la visibilidad de $v_i$, $v_f$, $a$ o $\Delta x$. La visibilidad final es AND entre el toggle y la condición física ($v_i \neq 0$, $v_f \neq 0$, $a \neq 0$ o $\Delta x \neq 0$)
- **Etiqueta $v_f$**: desaparece si el vector $v_f$ no es visible (por toggle desactivado, $v_f = 0$, o móvil $x_f$ oculto)

---

## 7. Flecha de desplazamiento (eje secundario)

Debajo del eje principal hay un segundo eje horizontal:

- **Desde** $x_i$ **hasta** $x_f$
- Dirección de la punta = signo del desplazamiento (→ si $v_i > 0$, ← si $v_i < 0$)
- Es una línea continua con punta de flecha (sin dashed)
- La línea termina en la base del triángulo (misma lógica que los vectores velocidad)

---

## 8. Casos especiales de renderizado

### 8.1 $x_i$ o $x_f$ cerca del origen

Cuando $x_i$ o $x_f$ están a menos de 50px en pantalla del origen:

- El elemento respectivo ($x_i$ o $x_f$) coloca su etiqueta **sobre el cuadrado** (misma altura que $t$), en vez de debajo del tick
- Si $x_i$ está en el origen exacto:
  - Móvil centrado sobre el tick del origen
  - Tick de $x_i$ = tick del origen (no hay tick separado)
- Si **ambos** $x_i$ y $x_f$ están elevados, $x_f$ se desplaza 18px más arriba que $x_i$ para evitar superposición

### 8.2 Cruce del origen ($x_i < 0 < x_f$ o $x_f < 0 < x_i$)

- El origen debe permanecer visible entre ambos ticks
- Tres ticks visibles: $x_i$, $x = 0$, $x_f$

---

## 9. Layout de la página

### 9.1 Estructura

La página del generador MRUV sigue la misma estructura de MRU v2:

**Sección izquierda (formulario):** cards con formulario usando CSS Grid (`grid-template-columns: 320px 1fr`).

- **Card 1 - "Datos del diagrama"** (`DiagramDataCard`): 4 campos de entrada visibles usando el componente reutilizable `InputWithUnit` ($x_i$, $v_i$, $a$, $t$). Los campos $x_f$ y $v_f$ están ocultos pero la lógica subyacente se mantiene para posible re-habilitación futura. Un botón **"Calcular"** se habilita cuando los 4 campos están llenos.
- **Card 2 - "Elementos del diagrama"** (`DiagramControlsCard`): tabla de controles con 7 filas ($x_i$, $x_f$, $v_i$, $v_f$, $a$, $t$, $\Delta x$). Columnas: *Etiqueta*, *Valor*, *Vector*, *Móvil*. Los checkboxes de $v_f$ se deshabilitan cuando el móvil $x_f$ está desactivado.
- **Card 3 - "Apariencia diagrama"** (`DiagramAppearanceCard`): selectores de personaje (cuadrado, persona, bicicleta, automóvil) y fondo (blanco, parque, ciudad, playa). Usando `CollapsibleCard`.

Debajo de los cards, botones **"Generar Diagrama"** y **"Borrar datos"**.

**Sección derecha (diagrama):** componente `DiagramContainer` que muestra header (título "Vista previa" + botón **"Exportar"**) y el SVG generado. Estados vacío/error con `height: 250px`.

### 9.2 Estilos

> Estilo de cards, layout de página, fuente, estados vacío/error y flujo de UI están en AGENTS.md > UI Conventions.

Las mismas tarjetas desplegables (`CollapsibleCard`) que MRU v2 para "Elementos del diagrama" y "Apariencia diagrama".

---

## 10. Notas de implementación

La variable calculada se auto-rellena y se marca como **computada**. Si el usuario edita el campo auto-computado, pasa a ser considerado **ingresado manualmente**.

Al cambiar una unidad mientras los campos están llenos, se limpia el campo correspondiente y el motor lo re-computa en la nueva unidad.

### 10.1 Campos ocultos

Los campos $x_f$ y $v_f$ están ocultos del formulario pero toda la lógica subyacente se mantiene:

- Los estados de formulario para $x_f$ y $v_f$ siguen existiendo
- El motor de física resuelve $x_f$ y $v_f$ a partir de $x_i$, $v_i$, $a$, $t$
- Los controles de visibilidad para $x_f$ y $v_f$ siguen funcionando
- Para re-habilitar estos campos, solo es necesario descomentar los `InputWithUnit` correspondientes en `DiagramDataCardMRUV.tsx`
