import { type IslandName } from '@archipielago/core/islands';
import { buildIslandLoaders } from './island-loaders';
import type { IslandModule } from './island-module';

export type { IslandModule, IslandName };

/**
 * Vite glob map injected by the host (lazy island TSX modules).
 *
 * Hosts call {@link setIslandModules} with `import.meta.glob(...)` from a
 * Vite-owned file so the relative glob stays under the product `ui/islands/`
 * tree. Archipielago does not hardcode host folder prefixes.
 */
let islandModules: Record<string, () => Promise<IslandModule>> | undefined;

let islandLoadersCache:
  Partial<Record<IslandName, () => Promise<IslandModule>>> | undefined;

/**
 * Supplies the Vite glob map used to build lazy island loaders.
 *
 * Clears the loader cache so the next {@link getIslandLoaders} rebuilds.
 *
 * @param {Record<string, () => Promise<IslandModule>>} modules - Glob result.
 * @returns {void}
 */
export function setIslandModules(
  modules: Record<string, () => Promise<IslandModule>>,
): void {
  islandModules = modules;
  islandLoadersCache = undefined;
}

/**
 * Clears the injected glob and loader cache (tests).
 *
 * @returns {void}
 */
export function resetIslandModules(): void {
  islandModules = undefined;
  islandLoadersCache = undefined;
}

/**
 * Returns lazy island loaders keyed by conventional glob names.
 *
 * Builds once after {@link setIslandModules}. The DOM is the allowlist at
 * hydrate time; this map only answers "which chunk loads this name".
 *
 * @returns {Partial<Record<IslandName, () => Promise<IslandModule>>>} Loaders.
 * @throws {Error} When modules have not been registered yet.
 */
export function getIslandLoaders(): Partial<
  Record<IslandName, () => Promise<IslandModule>>
> {
  if (islandLoadersCache !== undefined) {
    return islandLoadersCache;
  }

  if (islandModules === undefined) {
    throw new Error(
      'Island loaders require setIslandModules() (app island glob) before use',
    );
  }

  const loaders = buildIslandLoaders(islandModules);
  islandLoadersCache = loaders;
  return loaders;
}

/**
 * Clears the loader cache (tests that re-register islands).
 *
 * @returns {void}
 */
export function resetIslandLoadersCache(): void {
  islandLoadersCache = undefined;
}
