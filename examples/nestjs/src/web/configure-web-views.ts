import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { drihHandlebarsLocals, registerHydrateHelper } from '@drih/handlebars';
import type { AssetTags } from '@archipielago/core/page-assets.js';
import { loadClientManifest } from '@archipielago/vite/asset-delivery/asset-tags.js';
import { createPageAssets } from '@archipielago/vite/asset-delivery/page-assets.js';
import type { PageStylesheetName } from '@archipielago/vite/asset-delivery/page-stylesheets.js';
import { getViteDevServer } from '@archipielago/vite/page-loader.js';
import hbs from 'hbs';
import { registerAppPageStylesheets } from './page-stylesheets.js';

const viewsDir = (): string => join(process.cwd(), 'views');

/**
 * Reads compiled island CSS from the host sidecar folder.
 *
 * Drih does not compile SCSS. The Vite sidecar plugin writes `<name>.css`
 * next to the dehydrated HTML. A missing file means the island has no module
 * sheet, so the helper prints the wrapper without a style sibling.
 *
 * @param {string} name - Island folder name (`login-form`, `mobile-navigation`).
 * @returns {string | undefined} CSS text, or undefined when the sidecar is absent.
 */
export function readIslandCss(name: string): string | undefined {
  const filePath = join(
    viewsDir(),
    'components',
    'dehydrated-css',
    `${name}.css`,
  );

  if (!existsSync(filePath)) {
    return undefined;
  }

  const css = readFileSync(filePath, 'utf8');
  return css === '' ? undefined : css;
}

/**
 * Escapes a value for a double-quoted HTML attribute.
 *
 * @param {string} value - Raw attribute value.
 * @returns {string} Attribute-safe text.
 */
function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

/**
 * Builds head style and stylesheet tags from an asset bag.
 *
 * Island `<style data-css-island>` tags come from the Drih hydrate helper,
 * not from this list. This helper only prints the shell and opt-in page sheets.
 *
 * @param {AssetTags} tags - Stylesheets and inline styles for this request.
 * @returns {string} Markup for the document head.
 */
export function renderAssetHead(tags: AssetTags): string {
  const inline = tags.inlineStyles
    .map(
      ({ id, css }) =>
        `<style data-css="${escapeAttribute(id)}">${css}</style>`,
    )
    .join('');
  const links = tags.stylesheets
    .map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}" />`)
    .join('');
  return `${inline}${links}`;
}

/**
 * Builds module script tags from an asset bag.
 *
 * Empty when the request included no islands, so pages without hydrate skip
 * the client entry.
 *
 * @param {AssetTags} tags - Script URLs for this request.
 * @returns {string} Markup for the end of the document body.
 */
export function renderAssetScripts(tags: AssetTags): string {
  return tags.scripts
    .map(
      (src) => `<script type="module" src="${escapeAttribute(src)}"></script>`,
    )
    .join('');
}

/**
 * Resolves page asset tags once per Handlebars render.
 *
 * The view runs before the layout, so `drihSeen` already lists included
 * islands when the layout helpers run. Caching on the root avoids computing
 * the bag twice for `assetHead` and `assetScripts`.
 *
 * @param {Record<string, unknown>} root - Handlebars render root (res.locals).
 * @returns {AssetTags} Stylesheet, inline style, and script URLs.
 */
function pageAssetTags(root: Record<string, unknown>): AssetTags {
  const cached = root._pageAssets;
  if (
    cached !== undefined &&
    typeof cached === 'object' &&
    cached !== null &&
    'stylesheets' in cached
  ) {
    return cached as AssetTags;
  }

  const seen = root.drihSeen;
  const islandNames = seen instanceof Set ? [...seen].map(String) : [];
  const pageStylesheets = Array.isArray(root.pageStylesheets)
    ? (root.pageStylesheets as PageStylesheetName[])
    : [];
  const development =
    getViteDevServer() !== undefined || process.env.VITEST === 'true';

  const tags = createPageAssets(islandNames, {
    development,
    manifest: development ? undefined : loadClientManifest(),
    pageStylesheets,
  }).tags;
  root._pageAssets = tags;
  return tags;
}

/**
 * Configures Handlebars views, Drih includes, and the asset helpers.
 *
 * Call from bootstrap and from e2e boots that never run `main.ts`. The layout
 * is `views/layouts/app.hbs`. Partials live under `views/partials/`.
 *
 * @param {NestExpressApplication} app - Nest Express application.
 * @returns {Promise<void>} Resolves after partials are registered.
 */
export async function configureWebViews(
  app: NestExpressApplication,
): Promise<void> {
  const root = viewsDir();
  app.setBaseViewsDir(root);
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/app' });

  await new Promise<void>((resolve) => {
    hbs.registerPartials(join(root, 'partials'), () => {
      resolve();
    });
  });

  registerHydrateHelper(hbs, {
    dehydratedComponentsDir: join(root, 'components', 'dehydrated'),
    dehydratedComponentFileExtension: '.html',
    readStyles: readIslandCss,
  });

  hbs.registerHelper(
    'assetHead',
    function assetHead(this: Record<string, unknown>): unknown {
      return new hbs.handlebars.SafeString(
        renderAssetHead(pageAssetTags(this)),
      );
    },
  );
  hbs.registerHelper(
    'assetScripts',
    function assetScripts(this: Record<string, unknown>): unknown {
      return new hbs.handlebars.SafeString(
        renderAssetScripts(pageAssetTags(this)),
      );
    },
  );

  app.use(drihHandlebarsLocals());
  app.use(
    (
      _request: unknown,
      response: { locals: Record<string, unknown> },
      next: () => void,
    ) => {
      response.locals.year = new Date().getFullYear();
      next();
    },
  );

  registerAppPageStylesheets();
}
