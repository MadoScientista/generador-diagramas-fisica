# Plan: Rediseño de la tarjeta "Elementos del diagrama" (MRUV)

> Documento que describe el rediseño de la tarjeta "Elementos del diagrama" del generador MRUV. **Ya implementado**: el código actual (`DiagramControlsCardMRUV.tsx`) sigue esta especificación, con las salvedades marcadas en el texto.
> Alcance: **solo MRUV**. La tarjeta equivalente de MRU v1/v2 (`DiagramControlsCard`) no se modifica.

---

## 1. Problemas detectados

La tarjeta actual es una tabla de 5 columnas (`Var | Símbolo | Valor | Vector | Móvil`) con checkboxes sin etiqueta:

| # | Problema | Detalle |
|---|----------|---------|
| 1 | **Columnas engañosas** | La columna "Símbolo" es en realidad un checkbox que oculta/muestra toda la etiqueta. No hay pista visual de qué controla cada casilla. |
| 2 | **Sin accesibilidad** | Los checkboxes no tienen `aria-label`: las lectoras de pantalla anuncian "checkbox sin marcar" a secas. |
| 3 | **Estados deshabilitados crípticos** | El "Valor" se deshabilita si "Símbolo" está off; el "Vector" se deshabilita si la magnitud física es 0 (`a=0`, `vi=0`); la fila `vf` completa se deshabilita si el móvil de `xf` está off. Nada explica el porqué. |
| 4 | **Sin jerarquía física** | Las 7 variables aparecen como lista plana sin agrupar (posición, velocidad, aceleración). |
| 5 | **Sin feedback** | No se comunica que cada toggle actualiza el SVG en tiempo real. |

---

## 2. Alcance y decisiones tomadas

- **Alcance**: paquete completo (interruptores + etiquetado + estados deshabilitados explicados + agrupación + accesibilidad).
- **Valor ↔ Etiqueta**: auto-activación. Si el usuario activa "Valor" con la etiqueta apagada, la etiqueta se enciende automáticamente (se elimina el bloqueo).
- **Paridad con MRU**: no. Solo la tarjeta MRUV.

---

## 3. Cambios propuestos

### 3.1 Semántica y etiquetado (`DiagramControlsCardMRUV.tsx`)

- Headers de la tabla: `Var | Etiqueta | Valor | Vector | Móvil` (se elimina "Símbolo"; se conserva "Var" como nombre de la primera columna).
- Línea de ayuda arriba de la tabla: **"Marca qué elementos mostrar. Se actualiza al instante."** *(no implementada en el estado actual de la app).*
- `aria-label` en cada toggle: "Mostrar etiqueta de xi", "Mostrar valor de xi", "Mostrar vector de vi", "Mostrar móvil en xf", etc.

### 3.2 Interruptores (toggle switch) en vez de checkboxes

- Nuevo componente interno `ToggleSwitch`:
  - `<button type="button" role="switch" aria-checked aria-label title disabled>`.
  - Pill compacto: track 30×18px, knob 14px, borde redondeado.
  - Azul del sitio (`#2563eb`) cuando está ON, gris (`#d1d5db`) cuando OFF, gris apagado (`opacity: .35`) cuando deshabilitado.
  - Transición del knob y del fondo de 0.15s.
  - `:focus-visible` con anillo azul (`outline: 2px solid #2563eb; outline-offset: 2px`) para navegación por teclado.
- Usar `<button role="switch">` da click + teclado + accesibilidad sin código extra.

### 3.3 Estados deshabilitados explicados

Tres casos visualmente distintos:

| Caso | Cómo se muestra | Tooltip / aria-label |
|------|-----------------|----------------------|
| **No aplica** (columna que el elemento no tiene: Móvil en `vi/vf/a/t/dx`, Vector en `xi/xf/t`) | Raya gris "—" (`aria-hidden`), sin toggle | — |
| **Físicamente cero** (`vi`, `vf`, `a`, `dx` = 0) | Toggles deshabilitados (gris apagado) | "a = 0: este elemento no se dibuja" |
| **Fila vf dependiente** (móvil de `xf` off) | Toggles deshabilitados | "Activa el móvil de xf para mostrar vf" |

- El caso "físicamente cero" se detecta con una prop `physicalZeros?: { vi: boolean; vf: boolean; a: boolean; dx: boolean }`.
- Solo las filas `vi`, `vf`, `a`, `dx` pueden ser cero (sus etiquetas/valores/vectores no se dibujan cuando la magnitud es 0). `xi`, `xf`, `t` siempre se dibujan.

### 3.4 Auto-activación Valor → Etiqueta

- El toggle de "Valor" ya nunca se deshabilita por dependencia.
- Al encenderlo, si `showLabel` está en false, se llama `onControlChange(id, 'showLabel', true)` y luego `onControlChange(id, 'showValue', true)` (React agrupa ambos setState).

### 3.5 Agrupación por física

- Secciones con micro-etiqueta en mayúsculas + divisor sutil:
  - **Posición**: xi, xf
  - **Velocidad**: vi, vf
  - **Aceleración**: a
  - **Tiempo**: t
  - **Desplazamiento**: Δx
- Se reemplaza el zebra (`.controls-row-zebra`) por hover en fila + separadores de grupo.

### 3.6 Arquitectura del componente

Estructura propuesta para `DiagramControlsCardMRUV.tsx`:

```tsx
type Field = keyof ElementControls | 'showCharacter';
interface PhysicalZeros { vi: boolean; vf: boolean; a: boolean; dx: boolean }

function ToggleSwitch({ checked, disabled, label, onChange }: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) { /* <button role="switch"> + knob */ }

const CONTROL_GROUPS: Array<{
  title: string;
  rows: Array<{ id: keyof DiagramControls; label: string; hasVector: boolean; hasCharacter: boolean }>;
}> = [
  { title: 'Posición', rows: [/* xi */, /* xf */] },
  { title: 'Velocidad', rows: [/* vi */, /* vf */] },
  { title: 'Aceleración', rows: [/* a */] },
  { title: 'Tiempo', rows: [/* t */] },
  { title: 'Desplazamiento', rows: [/* dx */] },
];
```

Lógica por fila:
- `rowZero` = `physicalZeros[row.id]` para `vi/vf/a/dx`.
- `rowDisabled` = `id === 'vf' && !controls.xf.showCharacter`.
- `interactive` = `!rowZero && !rowDisabled`.
- Columna Vector/Móvil sin `hasVector`/`hasCharacter` → celda "—".
- Símbolos con subíndices vía `identToHTML` (ya implementado) + fuente `0.95rem` (clase `.element-symbol`).

---

## 4. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/ui/components/form/DiagramControlsCardMRUV.tsx` | Reestructuración completa: grupos, `ToggleSwitch`, celdas "—", tooltips, auto-activación, aria-labels, hint. |
| `src/pages/MRUVGeneratorPage.tsx` | Calcular `physicalZeros` con `useMemo` desde `resolvedValues` (SI) y pasarlo a la tarjeta. |
| `src/App.css` | Estilos `.toggle-switch`, `.controls-hint`, `.controls-group-label`, `.controls-cell.dim`, hover de fila, estado deshabilitado. |
| `docs/consideraciones/reglas-diagramas-mruv.md` | Actualizar la descripción de la Card 2 (estados, columnas, toggles). |
| `AGENTS.md` (opcional) | Actualizar la convención "Visibility table" si describe checkboxes. |

**Nota de plumbing**: el caso "físicamente cero" requiere pasar `resolvedValues` desde `useMRUVDiagram` (ya disponible en la página) hasta la tarjeta. El hook no se modifica.

---

## 5. Detalles de estilo (CSS)

```css
.toggle-switch {
  width: 30px; height: 18px;
  border-radius: 999px;
  background: #d1d5db; border: none;
  position: relative; padding: 0; cursor: pointer;
  transition: background 0.15s;
}
.toggle-switch .toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 14px; height: 14px; border-radius: 50%;
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
  transition: transform 0.15s;
}
.toggle-switch.on { background: #2563eb; }
.toggle-switch.on .toggle-knob { transform: translateX(12px); }
.toggle-switch:disabled { opacity: .35; cursor: not-allowed; }
.toggle-switch:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }

.controls-hint { font-size: .75rem; color: #666; margin-bottom: .25rem; }
.controls-group-label {
  grid-column: 1 / -1;
  font-size: .65rem; font-weight: 600;
  letter-spacing: .06em; text-transform: uppercase;
  color: #888; padding: .4rem 0 .1rem;
  border-top: 1px solid #eee;
}
.controls-cell.dim { color: #c0c0c0; }
.controls-row:hover .controls-cell { background: #f9f9f9; }
```

---

## 6. Verificación

- `npm run build` (typecheck + bundle).
- `npm run lint`.

---

## 7. Casos a probar manualmente

1. Activar "Valor" con etiqueta apagada → la etiqueta se enciende sola.
2. `a = 0` → fila `a` gris con tooltip "a = 0: este elemento no se dibuja".
3. `vi = 0` → fila `vi` gris.
4. Desactivar el móvil de `xf` → fila `vf` completa deshabilitada con tooltip.
5. Columnas "No aplica" → raya "—" (Móvil en `a/t/dx`, Vector en `xi/xf/t`).
6. Navegación con teclado: Tab llega a los interruptores, anillo de foco visible, Enter/Espacio alterna.
7. Lector de pantalla anuncia "Mostrar etiqueta de xi", "Mostrar valor de xi", etc.
8. Estado vacío (< 4 campos llenos): sin estados de cero, toggles normales.
