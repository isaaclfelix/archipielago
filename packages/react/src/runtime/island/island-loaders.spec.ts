import { describe, expect, it } from 'vitest';
import { buildIslandLoaders } from './island-loaders';
import type { IslandModule } from './island-module';

describe('buildIslandLoaders', () => {
  it('keeps conventional glob keys and drops others', () => {
    const loadLogin = async (): Promise<IslandModule> => ({
      default: () => null,
    });
    const loadGhost = async (): Promise<IslandModule> => ({
      default: () => null,
    });
    const loadOther = async (): Promise<IslandModule> => ({
      default: () => null,
    });

    const loaders = buildIslandLoaders({
      '../../islands/login-form/login-form.tsx': loadLogin,
      '../../islands/login-form/helper.tsx': loadOther,
      '../../islands/ghost/ghost.tsx': loadGhost,
      '../../pages/x/x.tsx': loadOther,
    });

    expect(Object.keys(loaders).sort()).toEqual(['ghost', 'login-form']);
    expect(loaders['login-form']).toBe(loadLogin);
    expect(loaders.ghost).toBe(loadGhost);
  });
});
