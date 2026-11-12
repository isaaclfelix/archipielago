/**
 * Host-facing Archipielago configuration.
 *
 * Tools load `archipielago.config.ts` from the host package via
 * {@link loadAndApplyArchipielagoConfig}. Engines use
 * {@link getArchipielagoPaths}; they do not branch on a registration mode
 * ([ADR-0036](../../../docs/adr/0036-drop-injected-islands-table.md)).
 *
 * Path roots stay Nest-example defaults in {@link getArchipielagoPaths} until a
 * second host needs overrides (Phase 3) — see ADR-0030.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  defaultArchipielagoPaths,
  getArchipielagoPaths,
  setArchipielagoPaths,
  type ArchipielagoPaths,
} from './paths.js';

/**
 * Optional host config file shape (`archipielago.config.ts` default export).
 *
 * Path overrides are not part of this surface yet (deferred to Phase 3).
 * Islands registration mode was removed ([ADR-0036]).
 */
export type ArchipielagoUserConfig = object;

/**
 * Resolved runtime config after defaults + user file / test overrides.
 */
export interface ArchipielagoResolvedConfig {
  paths: ArchipielagoPaths;
}

/**
 * Returns paths for tools and diagnostics.
 *
 * Paths always come from {@link getArchipielagoPaths} (sample defaults or
 * in-process test overrides via {@link setArchipielagoPaths}).
 *
 * @returns {ArchipielagoResolvedConfig} Current resolved configuration.
 */
export function getArchipielagoConfig(): ArchipielagoResolvedConfig {
  return {
    paths: getArchipielagoPaths(),
  };
}

/**
 * Restores path defaults.
 *
 * @returns {void}
 */
export function resetArchipielagoConfig(): void {
  setArchipielagoPaths(undefined);
}

/**
 * Applies a user config object.
 *
 * Pass `undefined` to restore path defaults. Path keys are not applied yet.
 *
 * @param {ArchipielagoUserConfig | undefined} config - Host overrides, or clear.
 * @returns {void}
 */
export function applyArchipielagoUserConfig(
  config: ArchipielagoUserConfig | undefined,
): void {
  if (config === undefined) {
    resetArchipielagoConfig();
  }
}

/**
 * Loads `archipielago.config.ts` from `rootDir` when present and applies it.
 *
 * Always resets to defaults first, then merges the file when it exists. Call
 * from CLI tools before reading paths.
 *
 * @param {string} rootDir - Repository root that may contain the config file.
 * @returns {Promise<ArchipielagoResolvedConfig>} Config after load/apply.
 */
export async function loadAndApplyArchipielagoConfig(
  rootDir: string,
): Promise<ArchipielagoResolvedConfig> {
  resetArchipielagoConfig();

  const configPath = join(rootDir, 'archipielago.config.ts');
  if (!existsSync(configPath)) {
    return getArchipielagoConfig();
  }

  const mod: { default?: ArchipielagoUserConfig } & ArchipielagoUserConfig =
    await import(pathToFileURL(configPath).href);
  const user = mod.default ?? mod;
  applyArchipielagoUserConfig(user);
  return getArchipielagoConfig();
}

/**
 * Defaults used when no host config file is present.
 *
 * @returns {ArchipielagoResolvedConfig} Sample-aligned defaults.
 */
export function defaultArchipielagoResolvedConfig(): ArchipielagoResolvedConfig {
  return {
    paths: { ...defaultArchipielagoPaths },
  };
}
