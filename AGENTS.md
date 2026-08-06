# AGENTS.md

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — `tsc -b && vite build` (typecheck runs first; build fails on TS errors)
- `npm run lint` — ESLint (flat config, ignores `dist/`)
- `npm run preview` — preview production build locally

There are no test scripts. There is no formatter configured. The build command is the primary verification step (`tsc -b` catches type errors).

## Architecture

Physics diagram generator deployed to GitHub Pages at `/generador-diagramas-fisica/`.

**Pipeline flow (the core abstraction):**
`validate → solve/resolve → infer → buildScene → layout → render(SVG)`

Each motion type (MRU, MRUV) is a `PhysicsModule` (interface in `src/core/types.ts:157`) that implements `validate → solve → infer → buildScene`. Modules are registered into a `ModuleRegistry`.

**Two engine classes** handle this pipeline:
- `PhysicsDiagramEngine` (`src/app/engine.ts`) — for MRU modules
- `PhysicsDiagramEngineMRUV` (`src/app/engine-mruv.ts`) — for MRUV modules

Note: engines are **not** unified yet. They duplicate the pipeline logic with different input shapes. MRU requires 3 fields; MRUV requires 4.

**Key directories:**
- `src/core/` — shared infrastructure: types, layout engine, SVG renderer, unit conversion, format helpers, sprite registry
- `src/modules/mru/` — MRU module (validation, physics, inference, scene-builder)
- `src/modules/mruv/` — MRUV module (same structure)
- `src/app/` — engine orchestration layer
- `src/hooks/` — React hooks wiring engines to UI (e.g., `usePhysicsEngine`, `usePhysicsEngineMRUV`, `useMRUDiagram`)
- `src/ui/components/` — layout, form, diagram display, shared components
- `src/pages/` — route pages; each generator page wires hooks to form + diagram components

**Routing:** `HashRouter` with routes defined in `src/router.tsx`. Three generator pages under `/generador/*`.

> **Note:** MRU and MRU v2 are excluded from navigation (NavBar/HomePage) since MRUV covers all their functionality. The code, routes, and pages remain in the repo and are still accessible via direct URL — only the UI entry points were removed.

## Conventions

- Do not modify anything unless the user explicitly indicates otherwise.
- **Language:** UI text, error messages, and comments are in Spanish.
- **Imports use `.ts`/`.tsx` extensions** everywhere (enforced by `verbatimModuleSyntax`).
- **React Compiler** is enabled via `babel-plugin-react-compiler` in `vite.config.ts`. This affects build performance and means hooks follow the Compiler's rules (no manual memoization needed in most cases).
- **SVG sprites** for characters (person, bike, car) live in `src/assets/sprites/` and are imported as raw SVG via Vite's `?raw` suffix, then converted to data URIs in `sprite-registry.ts`.
- **Unit system:** `src/core/units.ts` provides `toSI`/`fromSI` converters. All physics math works in SI base units; display units are converted at input/output boundaries.
- **Layout engine** (`src/core/layout-engine.ts`) maps physical values to screen coordinates using a viewport of 800x400 with 60px margins. It handles tick-gap enforcement and label collision avoidance.
- **Display precision:** diagram labels show values rounded to a maximum of 3 decimal places. This is a presentation-layer constraint, not a physics-domain rule.

## UI Conventions

- **Page layout:** CSS Grid `grid-template-columns: 320px 1fr`, gap `1rem`, padding `2rem`.
- **Cards:** `border: 1px solid #ddd; border-radius: 6px; padding: 1.5rem; background: white`, internal gap `0.5rem`.
- **Empty/error states:** diagram container uses `height: 250px`.
- **Label format:** `{identifier} = {value} {unit}` (e.g. `xi = 20 m`). Exception: origin label is `x = 0` (no unit).
- **Label style:** Inter (Roboto fallback), sans-serif, no italic. **Exception:** el generador de plano cartesiano usa IBM Plex Mono (`--plano-mono`) en los números del plano y etiquetas de unidad — no es un diagrama de física. El título de su tarjeta usa Inter, igual que las demás tarjetas.
- **Plano cartesiano:** colores de ejes/cuadrícula/etiquetas configurables (`settings.axes.color`, `settings.grid.color`, `settings.appearance.labelColor`), tamaño de etiquetas y fondo (`white`/`transparent`) en la tarjeta "Apariencia"; plantillas rápidas en `presets.ts` (aplicadas con `applySettings`); el SVG usa `key={svg}` para animar cambios. Tokens de diseño `--plano-*` en `App.css`. Exportación SVG (`useExportSVG`) y PNG (`useExportPNG`, canvas a escala 2×, 100% client-side).
- **Visibility table:** MRU uses the 3-column checkbox pattern (Etiqueta / Valor / Vector); Valor checkbox is disabled when Etiqueta is off. Vector visibility = AND(toggle, physical condition ≠ 0). The MRUV card (`DiagramControlsCardMRUV`) is redesigned: 5 columns (Var / Etiqueta / Valor / Vector / Móvil), `role="switch"` toggles with `aria-label`, rows grouped by physics, "—" cells for non-applicable columns, disabled rows when the physical magnitude is 0 or when vf depends on the xf móvil, and Valor auto-activates Etiqueta. See `docs/consideraciones/estilo-elemento-diagrama.md`.
- **CollapsibleCard pattern:** header with title + rotating chevron, content hidden via conditional rendering, used for secondary card sections (default closed).
- **UI flow:** user fills inputs → "Calcular" resolves missing variable → auto-fill → diagram generates → toggles update SVG in real time → "Borrar datos" resets everything to defaults.
- **Borrar datos:** resets all inputs, units, visibility toggles, character type, and diagram output to their defaults.

## Deployment

CI on `main` branch: `npm ci && npm run build` → GitHub Pages. Node 22. The `base` path in `vite.config.ts` must match the repo name: `/generador-diagramas-fisica/`.

## Skills

`.opencode/skills/` contains project-specific guidelines:
- `composition-patterns` — compound components, state lifting, React 19 APIs
- `frontend-design` — aesthetic guidelines (typography, motion, spatial composition)
- `react-best-practices` — performance optimization (re-renders, bundle, rendering)
- `mru-physics-domain` — MRU physics rules: equation, validation, error categories, precision
- `mruv-physics-domain` — MRUV physics rules (when created)

## Gotchas

- Build = typecheck + bundle (`tsc -b && vite build`). Always run `npm run build` to verify correctness — there are no separate typecheck or test commands.
- No test suite exists. Verification is lint + build only.
- Physical calculations must always be performed using the SI system; therefore, conversions must be made before carrying out any calculations.
- `useDiagramControls` is generic: `useDiagramControls<T>(defaults)`. Each page must pass its module-specific defaults object.
