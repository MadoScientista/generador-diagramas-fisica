import { useMemo } from 'react';
import { ModuleRegistry } from '../core/module-registry.ts';
import { PhysicsDiagramEngineMRUV } from '../app/engine-mruv.ts';
import { MRUVModule } from '../modules/mruv/index.ts';

export function usePhysicsEngineMRUV() {
  return useMemo(() => {
    const registry = new ModuleRegistry();
    registry.register(MRUVModule);
    const engine = new PhysicsDiagramEngineMRUV(registry);
    return { engine, registry };
  }, []);
}
