# Reglas de UI — Generador MRU v2

> Generador independiente del MRU v1. Comparte la misma estetica del diagrama, con diferencias en la interfaz de usuario.
> Las reglas de dominio físico están en `.opencode/skills/physics/mru-physics-domain/SKILL.md`.

Ruta: `/generador/mru-v2`

---

## 1. Diferencias con MRU v1

| Aspecto | MRU v1 | MRU v2 |
|---------|--------|--------|
| Tarjeta "Elementos del diagrama" | Card estatica siempre visible | **CollapsibleCard** (desplegable, cerrado por defecto) |
| Tarjeta "Apariencia diagrama" | No existe | **CollapsibleCard** (desplegable, cerrado por defecto) |
| Selector de movil | No existe | Selector con opciones: Cuadrado, Persona, Bicicleta, Automovil |
| Selector de fondo | No existe | Selector con opciones: Blanco, Parque, Ciudad, Playa |

Todo lo demas es identico al v1: mismos inputs, mismos controles de visibilidad, mismo SVG generado.

---

## 2. Tarjetas desplegables (CollapsibleCard)

> El patrón general (header + chevron, renderizado condicional) está en AGENTS.md > UI Conventions.

Componente reutilizable (`src/ui/components/shared/CollapsibleCard.tsx`).

### 2.1 Comportamiento

- Header clickeable con titulo y chevron (flecha hacia abajo/arriba)
- Al hacer clic se alterna entre abierto y cerrado
- El chevron rota 180 grados al abrirse (transicion CSS de 0.2s)
- El contenido se muestra/oculta con renderizado condicional (no animacion de altura)

### 2.2 Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `title` | `string` | requerido | Texto del header |
| `defaultOpen` | `boolean` | `true` | Estado inicial abierto/cerrado |
| `children` | `ReactNode` | requerido | Contenido interno |

### 2.3 Tarjetas en MRU v2

| Tarjeta | `defaultOpen` | Contenido |
|---------|---------------|-----------|
| "Elementos del diagrama" | `false` (cerrado) | `DiagramControlsCard` con `showTitle={false}` |
| "Apariencia diagrama" | `false` (cerrado) | `DiagramAppearanceCard` |

---

## 3. Tarjeta "Apariencia diagrama"

Componente `src/ui/components/form/DiagramAppearanceCard.tsx`.

### 3.1 Selectores

| Selector | Opciones | Default | Tipo |
|----------|----------|---------|------|
| **Movil** | Cuadrado, Persona, Bicicleta, Automovil | Cuadrado | `CharacterType` |
| **Fondo** | Blanco, Parque, Ciudad, Playa | Blanco | `BackgroundType` |

### 3.2 Tipos

```ts
type CharacterType = 'square' | 'person' | 'bike' | 'car';
type BackgroundType = 'white' | 'park' | 'city' | 'beach';
```

### 3.3 Estado

Los valores de movil y fondo se manejan con `useState` local en `MRUV2GeneratorPage`. Se resetean a sus valores por defecto (`square`, `white`) al presionar "Borrar datos".

### 3.4 Funcionalidad

El selector de **movil** es funcional: el valor se pasa a `useMRUDiagram(controls, character)` y se propaga al motor, cambiando el tipo de personaje en el SVG generado.

El selector de **fondo** es solo estructura visual por ahora. El valor se almacena en estado local pero no se pasa al motor ni al renderer. La implementacion de fondos se hara en una futura iteracion.

---

## 4. DiagramControlsCard con `showTitle`

El componente `DiagramControlsCard` acepta un prop opcional `showTitle` (default `true`):

- `showTitle={true}` (v1): renderiza `<div className="card"><h3>Elementos del diagrama</h3>...tabla...</div>`
- `showTitle={false}` (v2): renderiza solo la tabla de controles sin wrapper `.card` ni titulo, ya que el `CollapsibleCard` provee el titulo y el borde

---

## 5. Boton "Borrar datos"

> Comportamiento general: resetea todo a valores por defecto (AGENTS.md > UI Conventions).

En MRU v2, además de los campos MRU, se resetean:

| Campo adicional | Valor por defecto |
|-----------------|-------------------|
| Movil | `square` (Cuadrado) |
| Fondo | `white` (Blanco) |

---

## 6. Archivos exclusivos de v2

| Archivo | Descripcion |
|---------|-------------|
| `src/pages/MRUV2GeneratorPage.tsx` | Pagina del generador MRU v2 |
| `src/ui/components/shared/CollapsibleCard.tsx` | Componente de tarjeta desplegable |
| `src/ui/components/form/DiagramAppearanceCard.tsx` | Selectores de movil y fondo |

---

## 7. Componentes reutilizados de v1

| Componente/Hook | Uso en v2 |
|-----------------|-----------|
| `useMRUDiagram(controls)` | Mismo hook, misma logica |
| `useDiagramControls(defaults)` | Mismo hook, mismos toggles |
| `useExportSVG(svg, filename)` | Mismo hook, misma exportacion |
| `usePhysicsEngine()` | Mismo engine singleton |
| `DiagramDataCard` | Card "Datos del diagrama" sin cambios |
| `DiagramControlsCard` | Con `showTitle={false}` |
| `DiagramContainer` | Vista previa del SVG sin cambios |
| `InputWithUnit` | Inputs reutilizados sin cambios |
| `ControlRow` | Filas de controles sin cambios |

---

## 8. Estilos nuevos

Estilos agregados a `App.css` exclusivos de v2:

| Clase | Descripcion |
|-------|-------------|
| `.collapsible-card` | Wrapper con border, border-radius, background white |
| `.collapsible-card-header` | Flex row, cursor pointer, padding, font-weight 600 |
| `.collapsible-card-header:hover` | Background #f9f9f9 al pasar el mouse |
| `.chevron` | Flecha, transition de rotacion 0.2s |
| `.chevron.open` | Rotacion 180 grados |
| `.collapsible-card-body` | Padding interno |
| `.appearance-card` | Flex column, gap 1rem |
| `.appearance-field` | Flex column, gap 0.5rem |
| `.appearance-field label` | Font-size 0.85rem, font-weight 500 |
| `.appearance-field select` | Mismo estilo que los selects de unidad |
