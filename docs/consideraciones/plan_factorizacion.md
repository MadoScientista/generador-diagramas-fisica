# Plan de Refactorizacion — React, Hooks, Router y Componentes

## Objetivo

Refactorizar la aplicacion para:
1. Seguir efectivamente la filosofia de React
2. Contener hooks custom
3. Sin dependencias circulares
4. Separar elementos de vistas por componentes reutilizables con props definidas
5. Estructura de pagina: header, barra de navegacion, contenido principal y footer
6. Utilizar React Router
7. Sitio con acceso a distintos generadores de diagramas de fisica

---

## Arquitectura Actual vs Objetivo

### Estado actual
- **3 componentes TSX** (App.tsx, MRUForm.tsx, DiagramView.tsx + ExportButton.tsx)
- **0 hooks custom** (src/hooks/ existe pero esta vacio)
- **0 rutas** (no hay React Router)
- **Toda la logica en App.tsx** (11 useState, ~200 lineas)
- **Sin NavBar ni Footer**

### Arquitectura objetivo
```
src/
├── main.tsx                          (modificar: agregar HashRouter)
├── App.tsx                           (modificar: simplificar a shell)
├── App.css                           (modificar: reorganizar estilos)
├── router.tsx                        (CREAR)
│
├── hooks/
│   ├── useMRUDiagram.ts              (CREAR)
│   ├── useDiagramControls.ts         (CREAR)
│   ├── useExportSVG.ts               (CREAR)
│   └── usePhysicsEngine.ts           (CREAR)
│
├── pages/
│   ├── HomePage.tsx                  (CREAR)
│   └── MRUGeneratorPage.tsx          (CREAR)
│
├── ui/components/
│   ├── layout/
│   │   ├── Header.tsx                (CREAR)
│   │   ├── NavBar.tsx                (CREAR)
│   │   ├── Footer.tsx                (CREAR)
│   │   └── PageLayout.tsx            (CREAR)
│   ├── form/
│   │   ├── InputWithUnit.tsx         (CREAR)
│   │   ├── DiagramDataCard.tsx       (CREAR)
│   │   ├── DiagramControlsCard.tsx   (CREAR)
│   │   └── ControlRow.tsx            (CREAR)
│   ├── diagram/
│   │   └── DiagramContainer.tsx      (CREAR)
│   ├── ExportButton.tsx              (modificar)
│   ├── MRUForm.tsx                   (ELIMINAR)
│   └── DiagramView.tsx               (ELIMINAR)
│
├── core/                             (sin cambios)
├── modules/                          (sin cambios)
└── app/                              (sin cambios)
```

---

## Fase 0: Dependencias

```bash
npm install react-router-dom
```

---

## Fase 1: Hooks Custom

### 1.1 `src/hooks/usePhysicsEngine.ts`

Instancia singleton del engine + registry.

```tsx
// Extrae la logica de App.tsx (lineas 18-20):
//   const registry = new ModuleRegistry();
//   registry.register(MRUModule);
//   const engine = new PhysicsDiagramEngine(registry);
//
// Retorna: { engine, registry }
// Patron: instancia via modulo (creada una vez fuera del hook)
```

### 1.2 `src/hooks/useExportSVG.ts`

Logica de descarga de SVG.

```tsx
// Input: svg: string | null
// Output: { exportSVG, isReady }
// Extrae la logica de ExportButton.tsx (lineas 6-17)
```

### 1.3 `src/hooks/useDiagramControls.ts`

Estado de los toggles de visibilidad.

```tsx
// Output: { controls, handleControlChange, resetControls }
// Maneja useState<DiagramControls> con DEFAULT_CONTROLS
// Extrae handleControlChange de App.tsx (lineas 90-94)
```

### 1.4 `src/hooks/useMRUDiagram.ts`

Hook principal. Absorbe toda la logica de App.tsx.

```tsx
// Input: controls: DiagramControls
// Output: {
//   values, units, result, computedField,
//   handleChange, handleUnitChange,
//   handleCalculate, handleSubmit, clearAll
// }
// Internamente: 9 useState, 2 useRef, 3 useCallback, 1 useEffect
// USA usePhysicsEngine() para la instancia del engine
```

---

## Fase 2: Componentes de Layout

### 2.1 `src/ui/components/layout/Header.tsx`

```tsx
// Sin props
// Renderiza: <header> con h1 + subtitulo
```

### 2.2 `src/ui/components/layout/NavBar.tsx`

```tsx
// Sin props (usa NavLink de react-router-dom)
// Links: / (Inicio), /generador/mru (MRU)
// NavLink detecta ruta activa -> clase .active
```

### 2.3 `src/ui/components/layout/Footer.tsx`

```tsx
// Sin props
// Renderiza: <footer> con info del sitio
```

### 2.4 `src/ui/components/layout/PageLayout.tsx`

```tsx
// Renderiza: Header > NavBar > <Outlet /> > Footer
// Estilos: flex column, min-height: 100vh
```

---

## Fase 3: Componentes de Formulario

### 3.1 `src/ui/components/form/InputWithUnit.tsx`

```tsx
interface InputWithUnitProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  unit: string;
  units: readonly string[];
  onChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
}
// Reutiliza estilos .input-with-unit existentes
```

### 3.2 `src/ui/components/form/ControlRow.tsx`

```tsx
interface ControlRowProps {
  id: keyof DiagramControls;
  label: string;
  hasVector: boolean;
  control: ElementControls;
  onControlChange: (element, field, value) => void;
}
// Fila de la tabla de controles
// showValue se deshabilita si !showLabel
```

### 3.3 `src/ui/components/form/DiagramDataCard.tsx`

```tsx
interface DiagramDataCardProps {
  values: { x0, v, t, xf };
  onChange, x0Unit, xfUnit, timeUnit, velUnit,
  onX0UnitChange, onXfUnitChange, onTimeUnitChange, onVelUnitChange,
  onCalculate
}
// Card "Datos del diagrama": 4 InputWithUnit + boton Calcular
```

### 3.4 `src/ui/components/form/DiagramControlsCard.tsx`

```tsx
interface DiagramControlsCardProps {
  controls: DiagramControls;
  onControlChange: (element, field, value) => void;
}
// Card "Elementos del diagrama": header + filas ControlRow
```

---

## Fase 4: Componentes de Diagrama

### 4.1 `src/ui/components/diagram/DiagramContainer.tsx`

```tsx
interface DiagramContainerProps {
  svg: string | null;
  error: string | null;
  errorDetail?: string | null;
}
// Reemplaza DiagramView.tsx
// Header (titulo + ExportButton) + contenido SVG
// Usa useExportSVG(svg) internamente
```

### 4.2 `src/ui/components/ExportButton.tsx` (modificar)

```tsx
// Antes: logica inline de handleExport
// Despues: const { exportSVG } = useExportSVG(svg)
```

---

## Fase 5: Paginas

### 5.1 `src/pages/HomePage.tsx`

```tsx
// Catalogo de generadores disponibles
// Cards con Link a /generador/[id]
// Por ahora solo MRU, preparado para mas
```

### 5.2 `src/pages/MRUGeneratorPage.tsx`

```tsx
// Orquesta hooks y componentes:
//   useDiagramControls() -> controls
//   useMRUDiagram(controls) -> values, units, result, handlers
//   <DiagramDataCard /> -> formulario
//   <DiagramControlsCard /> -> toggles
//   <DiagramContainer /> -> vista previa del diagrama
// Grid de 2 columnas (formulario 320px + diagrama 1fr)
```

---

## Fase 6: Router

### 6.1 `src/router.tsx`

```tsx
<Routes>
  <Route element={<PageLayout />}>
    <Route index element={<HomePage />} />
    <Route path="generador/mru" element={<MRUGeneratorPage />} />
  </Route>
</Routes>
```

---

## Fase 7: Punto de Entrada

### 7.1 `src/main.tsx` (modificar)

```tsx
// Envolver App con <HashRouter> (compatibilidad GitHub Pages)
```

### 7.2 `src/App.tsx` (modificar drasticamente)

```tsx
// Antes: ~200 lineas
// Despues: <AppRoutes /> (~10 lineas)
```

---

## Fase 8: Estilos

Reorganizar `App.css`:
- Renombrar `.app-header` a `.site-header`
- Agregar: `.navbar`, `.site-footer`, `.page-layout`, `.page-content`
- Agregar: `.home-page`, `.generator-cards`
- Mover `.app-main` a `.generator-page`
- Estilos existentes (.card, .controls-*, .diagram-*, .input-with-unit) se mantienen

---

## Orden de Implementacion

| Paso | Accion | Dependencias |
|------|--------|-------------|
| 0 | `npm install react-router-dom` | — |
| 1 | Crear `usePhysicsEngine.ts` | — |
| 2 | Crear `useExportSVG.ts` | — |
| 3 | Crear `useDiagramControls.ts` | — |
| 4 | Crear `useMRUDiagram.ts` | Paso 1 |
| 5 | Crear `Header.tsx` | — |
| 6 | Crear `NavBar.tsx` | Paso 0 |
| 7 | Crear `Footer.tsx` | — |
| 8 | Crear `PageLayout.tsx` | Pasos 5-7 |
| 9 | Crear `InputWithUnit.tsx` | — |
| 10 | Crear `ControlRow.tsx` | — |
| 11 | Crear `DiagramDataCard.tsx` | Paso 9 |
| 12 | Crear `DiagramControlsCard.tsx` | Paso 10 |
| 13 | Crear `DiagramContainer.tsx` | Paso 2 |
| 14 | Modificar `ExportButton.tsx` | Paso 2 |
| 15 | Crear `HomePage.tsx` | Paso 0 |
| 16 | Crear `MRUGeneratorPage.tsx` | Pasos 3, 4, 11, 12, 13 |
| 17 | Crear `router.tsx` | Paso 0, Pasos 8, 15, 16 |
| 18 | Modificar `main.tsx` | Paso 17 |
| 19 | Modificar `App.tsx` | Paso 17 |
| 20 | Eliminar `MRUForm.tsx` | Paso 16 |
| 21 | Eliminar `DiagramView.tsx` | Paso 13 |
| 22 | Reorganizar `App.css` | Todos |
| 23 | `npm run build` | Todos |
| 24 | `npm run lint` | Todos |

---

## Verificacion Final

1. `npm run lint` — sin errores
2. `npm run build` — build exitoso
3. `npm run dev` — verificar manualmente:
   - Navegacion Inicio <-> MRU funciona
   - Generador MRU funciona igual que antes
   - Boton "Borrar datos" resetea todo
   - Toggles de visibilidad funcionan
   - Exportacion SVG funciona
   - Layout responsive en mobile
   - Navbar muestra ruta activa

---

## Notas

- **HashRouter** se usa por compatibilidad con GitHub Pages (base path `/generador-diagramas-fisica/`)
- **core/ y modules/** no se tocan — el motor fisico queda intacto
- **Dependencias circulares** no se introducen — el grafo se mantiene como DAG
- Los hooks reciben parametros explicitos, no dependen de context globales
- Cada fase deja el proyecto funcional; los reemplazos son al final
