import { islandNameFromGlobKey } from './island-glob-key';
import type { IslandModule, IslandName } from './island-module';

/**
 * Builds lazy island loaders from a Vite glob map.
 *
 * Conventional `ui/islands/<name>/<name>.tsx` keys become named loaders. The
 * DOM is the allowlist at hydrate time; this map only answers which chunk
 * loads a name.
 *
 * @param {Record<string, () => Promise<IslandModule>>} modules - Glob result.
 * @returns {Partial<Record<IslandName, () => Promise<IslandModule>>>} Loaders.
 */
export function buildIslandLoaders(
  modules: Record<string, () => Promise<IslandModule>>,
): Partial<Record<IslandName, () => Promise<IslandModule>>> {
  return Object.fromEntries(
    Object.entries(modules).flatMap(([key, load]) => {
      const name = islandNameFromGlobKey(key);
      if (name === undefined) {
        return [];
      }
      return [[name, load] as const];
    }),
  );
}
