import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { extractCssFromViteModule } from '../asset-delivery/page-assets.js';
import { islandNameFromCssModuleId } from './vite-suppress-island-css-inject.js';

export type WriteIslandCssSidecarOptions = {
  /** Directory that holds `<name>/<name>.tsx` island folders. */
  islandsDir: string;
  /** Directory that receives `<name>.css` next to dehydrated HTML. */
  outDir: string;
};

/**
 * Absolute path of one island CSS sidecar file.
 *
 * @param {string} outDir - Absolute sidecar directory.
 * @param {string} name - Island folder name.
 * @returns {string} Absolute `.css` path.
 */
export function islandCssSidecarPath(outDir: string, name: string): string {
  return join(outDir, `${name}.css`);
}

/**
 * List island names that have a colocated CSS module.
 *
 * @param {string} islandsDir - Absolute islands directory.
 * @returns {string[]} Sorted kebab names.
 */
export function listIslandCssNames(islandsDir: string): string[] {
  if (!existsSync(islandsDir)) {
    return [];
  }

  return readdirSync(islandsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(islandsDir, name, `${name}.module.scss`)))
    .sort();
}

/**
 * Write or replace one sidecar CSS file.
 *
 * An empty string deletes the file so a removed module does not linger.
 *
 * @param {string} outDir - Absolute sidecar directory.
 * @param {string} name - Island folder name.
 * @param {string} css - Compiled CSS text.
 * @returns {void}
 */
export function writeIslandCssSidecarFile(
  outDir: string,
  name: string,
  css: string,
): void {
  mkdirSync(outDir, { recursive: true });
  const filePath = islandCssSidecarPath(outDir, name);

  if (css === '') {
    rmSync(filePath, { force: true });
    return;
  }

  writeFileSync(filePath, css);
}

/**
 * Remove one sidecar CSS file.
 *
 * @param {string} outDir - Absolute sidecar directory.
 * @param {string} name - Island folder name.
 * @returns {void}
 */
export function deleteIslandCssSidecarFile(outDir: string, name: string): void {
  rmSync(islandCssSidecarPath(outDir, name), { force: true });
}

/**
 * Resolve an island name from a watcher path under the islands directory.
 *
 * @param {string} file - Path reported by Vite.
 * @param {string} islandsDir - Absolute islands directory.
 * @returns {string | undefined} Island name when the path is an entry or its CSS module.
 */
export function islandNameFromIslandsPath(
  file: string,
  islandsDir: string,
): string | undefined {
  const cssName = islandNameFromCssModuleId(file);

  if (cssName) {
    return cssName;
  }

  const normalized = resolve(file).replace(/\\/g, '/');
  const root = resolve(islandsDir).replace(/\\/g, '/');
  const match = new RegExp(
    `^${root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)/\\1\\.tsx$`,
  ).exec(normalized);

  return match?.[1];
}

/**
 * Writes compiled island CSS next to dehydrated HTML.
 *
 * Development uses the running Vite server so class hashes match dehydration.
 * Production copies CSS assets from the client bundle. The sidecar folder is
 * gitignored host output; Drih still writes HTML only.
 *
 * @param {WriteIslandCssSidecarOptions} options - Island source and CSS output dirs.
 * @returns {Plugin} Vite plugin.
 */
export function writeIslandCssSidecar(
  options: WriteIslandCssSidecarOptions,
): Plugin {
  let islandsDir = options.islandsDir;
  let outDir = options.outDir;

  return {
    name: 'archipielago:write-island-css-sidecar',
    /**
     * Resolve folders from the host Vite root.
     *
     * @param {ResolvedConfig} config - Final Vite config.
     * @returns {void}
     */
    configResolved(config: ResolvedConfig): void {
      islandsDir = resolve(config.root, options.islandsDir);
      outDir = resolve(config.root, options.outDir);
    },
    /**
     * Compile every island CSS module at startup and keep the sidecar in sync.
     *
     * @param {ViteDevServer} server - Running Vite server.
     * @returns {Promise<void>}
     */
    async configureServer(server: ViteDevServer): Promise<void> {
      /**
       * Transform one island CSS module and write the sidecar.
       *
       * @param {string} name - Island folder name.
       * @returns {Promise<void>}
       */
      const writeName = async (name: string): Promise<void> => {
        const modulePath = join(islandsDir, name, `${name}.module.scss`);

        if (!existsSync(modulePath)) {
          deleteIslandCssSidecarFile(outDir, name);
          return;
        }

        const result = await server.transformRequest(
          `/${options.islandsDir}/${name}/${name}.module.scss`,
        );
        const css = result?.code ? extractCssFromViteModule(result.code) : '';

        writeIslandCssSidecarFile(outDir, name, css);
      };

      for (const name of listIslandCssNames(islandsDir)) {
        await writeName(name);
      }

      /**
       * Refresh or delete one sidecar after a watcher event.
       *
       * @param {string} file - Path reported by the watcher.
       * @returns {Promise<void>}
       */
      const onIslandFile = async (file: string): Promise<void> => {
        const name = islandNameFromIslandsPath(file, islandsDir);

        if (name === undefined) {
          return;
        }

        if (!existsSync(join(islandsDir, name, `${name}.tsx`))) {
          deleteIslandCssSidecarFile(outDir, name);
          return;
        }

        await writeName(name);
      };

      server.watcher.on('add', (file) => {
        void onIslandFile(file);
      });
      server.watcher.on('change', (file) => {
        void onIslandFile(file);
      });
      server.watcher.on('unlink', (file) => {
        void onIslandFile(file);
      });
    },
    /**
     * Copy island CSS assets from the client bundle into the sidecar folder.
     *
     * @param {unknown} _options - Rollup output options (unused).
     * @param {Record<string, { type: string; fileName?: string; source?: string | Uint8Array; originalFileNames?: readonly string[] }>} bundle - Output bundle.
     * @returns {void}
     */
    generateBundle(
      _options: unknown,
      bundle: Record<
        string,
        {
          type: string;
          fileName?: string;
          source?: string | Uint8Array;
          originalFileNames?: readonly string[];
        }
      >,
    ): void {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName?.endsWith('.css')) {
          continue;
        }

        for (const original of output.originalFileNames ?? []) {
          const name = islandNameFromCssModuleId(original);

          if (name === undefined || output.source === undefined) {
            continue;
          }

          const css =
            typeof output.source === 'string'
              ? output.source
              : Buffer.from(output.source).toString('utf8');

          writeIslandCssSidecarFile(outDir, name, css);
        }
      }
    },
  };
}
