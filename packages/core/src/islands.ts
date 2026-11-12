/**
 * Island path helpers for Archipielago engines.
 *
 * The product app owns island folders. Hydrate loaders come from a Vite glob;
 * the DOM is the allowlist. There is no injected `hasCssModule` table
 * ([ADR-0036](../../../docs/adr/0036-drop-injected-islands-table.md)).
 */

import { getArchipielagoPaths } from './paths.js';

/** Kebab-case island folder name (`login-form`, `mobile-navigation`). */
export type IslandName = string;

/**
 * Dev-only Vite URL for an island CSS module, when the island has one.
 */
export type IslandCssModulePath = string;

/**
 * Returns the Vite client-manifest source key for an island's TSX entry.
 *
 * Concrete implementation file (not the thin barrel), so registry dynamic
 * imports and host asset lookup share one path shape.
 *
 * @param {string} name - Island folder / registry name (kebab-case).
 * @returns {string} Manifest key under the configured islands directory.
 */
export function islandEntryRelPath(name: string): string {
  const { islandsDirRel } = getArchipielagoPaths();
  return `${islandsDirRel}/${name}/${name}.tsx`;
}

/**
 * Returns the Vite-dev URL for an island's CSS module.
 *
 * @param {string} name - Island folder / registry name (kebab-case).
 * @returns {IslandCssModulePath} Absolute-from-root Vite URL.
 */
export function islandCssModulePath(name: string): IslandCssModulePath {
  const { islandsDirDevPrefix } = getArchipielagoPaths();
  return `${islandsDirDevPrefix}/${name}/${name}.module.scss`;
}

/**
 * Vite client-manifest source key for an island's TSX entry.
 *
 * @param {IslandName} name - Island folder name.
 * @returns {string} Manifest key under the islands directory.
 */
export function islandManifestSourceKey(name: IslandName): string {
  return islandEntryRelPath(name);
}
