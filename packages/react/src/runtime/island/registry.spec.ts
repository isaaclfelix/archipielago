import {
  getIslandLoaders,
  resetIslandLoadersCache,
  resetIslandModules,
  setIslandModules,
} from './registry';
import type { IslandModule } from './island-module';

/**
 * Installs a two-island fixture and matching conventional glob loaders.
 *
 * @returns {void}
 */
function installFixtureIslands(): void {
  setIslandModules({
    '../../islands/login-form/login-form.tsx':
      async (): Promise<IslandModule> => ({
        default: () => null,
      }),
    '../../islands/toggle-stub/toggle-stub.tsx':
      async (): Promise<IslandModule> => ({
        default: () => null,
      }),
  });
  resetIslandLoadersCache();
}

describe('island registry', () => {
  beforeEach(() => {
    installFixtureIslands();
  });

  afterEach(() => {
    resetIslandModules();
  });

  it('keeps loaders in sync with conventional glob keys', () => {
    expect(Object.keys(getIslandLoaders()).sort()).toEqual([
      'login-form',
      'toggle-stub',
    ]);
  });

  it('exposes a lazy loader function per glob island', () => {
    // Do not invoke loaders here — that would boot real modules (e2e / TD-033).
    const loaders = getIslandLoaders();
    expect(loaders['login-form']).toBeTypeOf('function');
    expect(loaders['toggle-stub']).toBeTypeOf('function');
  });

  it('requires setIslandModules before building loaders', () => {
    resetIslandModules();
    expect(() => getIslandLoaders()).toThrow(/setIslandModules/);
    // Restore fixture loaders so later specs in this file keep working.
    installFixtureIslands();
  });

  it('returns the cached loader map on a second call', () => {
    const first = getIslandLoaders();
    const second = getIslandLoaders();
    expect(second).toBe(first);
  });
});
