import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getArchipielagoPaths } from '@archipielago/core/paths.js';
import type { PageAssets } from '@archipielago/core/page-assets.js';
import { shellCssBudgetBytes } from '@archipielago/core/shell-css-budget.js';
import {
  assetTagsFromManifest,
  developmentAssetTags,
  developmentShellOnlyAssetTags,
  pageStylesheetHrefs,
  shellStylesheetFromManifest,
  type AssetTags,
  type ClientManifest,
} from './asset-tags.js';
import type { PageStylesheetName } from './page-stylesheets.js';
import { chooseShellDelivery } from './shell-css-delivery.js';

export type { PageAssets };

/** Absolute directory that holds production client assets. */
function clientOutDir(): string {
  const { clientOutDirRel } = getArchipielagoPaths();
  return join(process.cwd(), clientOutDirRel);
}

/**
 * Reads the built shell CSS text from the client output.
 *
 * @param {ClientManifest} manifest - Vite client manifest.
 * @returns {string} Uncompressed CSS source.
 * @throws {Error} When the shell file cannot be resolved or read.
 */
export function loadShellCssText(manifest: ClientManifest): string {
  const href = shellStylesheetFromManifest(manifest);
  const relative = href.replace(/^\//, '');
  return readFileSync(join(clientOutDir(), relative), 'utf8');
}

/**
 * Builds production shell tags: inline under budget, otherwise a stylesheet link.
 *
 * @param {ClientManifest} manifest - Vite client manifest.
 * @param {string} cssText - Built shell CSS.
 * @param {number} budgetBytes - Raw-byte inline budget.
 * @returns {Pick<AssetTags, 'stylesheets' | 'inlineStyles'>} Shell-only style delivery.
 */
export function shellStyleTags(
  manifest: ClientManifest,
  cssText: string,
  budgetBytes: number,
): Pick<AssetTags, 'stylesheets' | 'inlineStyles'> {
  const delivery = chooseShellDelivery(cssText, budgetBytes);
  const shellHref = shellStylesheetFromManifest(manifest);

  if (delivery.mode === 'inline') {
    return {
      stylesheets: [],
      inlineStyles: [{ id: 'shell', css: delivery.css }],
    };
  }

  return {
    stylesheets: [shellHref],
    inlineStyles: [],
  };
}

/**
 * Pulls CSS text out of a Vite transform result.
 *
 * Plain CSS transforms return CSS. CSS-module transforms may return a JS
 * module that embeds the CSS as a string — recover that string when present.
 *
 * @param {string} code - Vite `transformRequest` code.
 * @returns {string} CSS suitable for a `<style>` tag.
 */
export function extractCssFromViteModule(code: string): string {
  // CSS module JS often contains: const __vite__css = "...";
  const viteCss = /const\s+__vite__css\s*=\s*("(?:\\.|[^"\\])*")/.exec(code);

  if (viteCss?.[1]) {
    return JSON.parse(viteCss[1]) as string;
  }

  // Already CSS (no JS module wrapper).
  if (
    !code.includes('import.meta') &&
    !code.trimStart().startsWith('import ') &&
    !code.includes('export default')
  ) {
    return code;
  }

  return '';
}

/**
 * Appends opt-in page stylesheet links to asset tags.
 *
 * @param {AssetTags} tags - Shell / hydrate tags.
 * @param {readonly PageStylesheetName[]} pageStylesheets - Sheets this page opted into.
 * @param {{ development: boolean; manifest?: ClientManifest }} source - Asset source.
 * @returns {AssetTags} Tags with page sibling `<link>` hrefs appended.
 */
function withPageStylesheets(
  tags: AssetTags,
  pageStylesheets: readonly PageStylesheetName[],
  source: { development: boolean; manifest?: ClientManifest },
): AssetTags {
  const hrefs = pageStylesheetHrefs(pageStylesheets, source);

  if (hrefs.length === 0) {
    return tags;
  }

  return {
    ...tags,
    stylesheets: [...tags.stylesheets, ...hrefs],
  };
}

/**
 * Builds document tags for one page render.
 *
 * Development keeps the shell as a `<link>` for HMR. Production may inline
 * the shell when under the raw-byte budget. Opt-in page siblings (e.g. forms)
 * are always head `<link>`s when the page declares them. Island CSS is not
 * in this bag — the host includes sidecar files through the template helper.
 *
 * @param {readonly string[]} islandNames - Islands included on this request.
 * @param {{ development: boolean; manifest?: ClientManifest; pageStylesheets?: readonly PageStylesheetName[] }} source - Asset source.
 * @returns {PageAssets} Document tags. Scripts are empty when no islands ran.
 */
export function createPageAssets(
  islandNames: readonly string[],
  source: {
    development: boolean;
    manifest?: ClientManifest;
    pageStylesheets?: readonly PageStylesheetName[];
  },
): PageAssets {
  const pageStylesheets = source.pageStylesheets ?? [];

  if (source.development) {
    const base =
      islandNames.length === 0
        ? developmentShellOnlyAssetTags()
        : developmentAssetTags();
    return {
      tags: withPageStylesheets(base, pageStylesheets, {
        development: true,
      }),
    };
  }

  if (!source.manifest) {
    throw new Error('Production pages need the client manifest.');
  }

  const cssText = loadShellCssText(source.manifest);
  const shell = shellStyleTags(source.manifest, cssText, shellCssBudgetBytes());
  const pageLinks = {
    development: false as const,
    manifest: source.manifest,
  };

  if (islandNames.length === 0) {
    return {
      tags: withPageStylesheets(
        {
          stylesheets: shell.stylesheets,
          inlineStyles: shell.inlineStyles,
          scripts: [],
        },
        pageStylesheets,
        pageLinks,
      ),
    };
  }

  const runtime = assetTagsFromManifest(source.manifest);
  const shellHref = shellStylesheetFromManifest(source.manifest);

  return {
    tags: withPageStylesheets(
      {
        stylesheets: [
          ...shell.stylesheets,
          ...runtime.stylesheets.filter((href) => href !== shellHref),
        ],
        inlineStyles: shell.inlineStyles,
        scripts: runtime.scripts,
      },
      pageStylesheets,
      pageLinks,
    ),
  };
}
