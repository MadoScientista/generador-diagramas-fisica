import { useMemo } from 'react';
import { ModuleRegistry } from '../core/module-registry.ts';
import { PhysicsDiagramEngine } from '../app/engine.ts';
import { MRUModule } from '../modules/mru/index.ts';

export function usePhysicsEngine() {
  return useMemo(() => {
    const registry = new ModuleRegistry();
    registry.register(MRUModule);
    const engine = new PhysicsDiagramEngine(registry);
    return { engine, registry };
  }, []);
}
