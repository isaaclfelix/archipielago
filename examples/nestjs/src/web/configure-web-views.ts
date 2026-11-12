import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { drihHandlebarsLocals, registerHydrateHelper } from '@drih/handlebars';
import type { AssetTags } from '@archipielago/core/page-assets.js';
import { loadClientManifest } from '@archipielago/vite/asset-delivery/asset-tags.js';
import { createPageAssets } from '@archipielago/vite/asset-delivery/page-assets.js';
import type { PageStylesheetName } from '@archipielago/vite/asset-delivery/page-stylesheets.js';
import { islandCssReader } from '@archipielago/vite/asset-delivery/read-island-css.js';
import { getViteDevServer } from '@archipielago/vite/page-loader.js';
import hbs from 'hbs';
import { registerAppPageStylesheets } from './page-stylesheets.js';

const viewsDir = (): string => join(process.cwd(), 'views');

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
 * Reads island names recorded by `{{{hydrate}}}` on this render.
 *
 * Express `hbs` renders the view, then the layout. Home islands live in the
 * layout header, which runs *after* `{{{assetHead}}}` in `<head>`. Scripts
 * must be computed from `drihSeen` at `{{{assetScripts}}}`, not cached from
 * the head helper.
 *
 * @param {Record<string, unknown>} root - Handlebars render root (res.locals).
 * @returns {string[]} Island folder names included on this request.
 */
function islandNamesFrom(root: Record<string, unknown>): string[] {
  const seen = root.drihSeen;
  return seen instanceof Set ? [...seen].map(String) : [];
}

/**
 * Builds the asset bag for this render.
 *
 * Head styles do not depend on islands (island CSS is a sibling `<style>`
 * from the hydrate helper). Pass `islandNames` only when emitting scripts.
 *
 * @param {Record<string, unknown>} root - Handlebars render root (res.locals).
 * @param {readonly string[]} islandNames - Islands included so far.
 * @returns {AssetTags} Stylesheet, inline style, and script URLs.
 */
function pageAssetTags(
  root: Record<string, unknown>,
  islandNames: readonly string[],
): AssetTags {
  const pageStylesheets = Array.isArray(root.pageStylesheets)
    ? (root.pageStylesheets as PageStylesheetName[])
    : [];
  const development =
    getViteDevServer() !== undefined || process.env.VITEST === 'true';

  return createPageAssets(islandNames, {
    development,
    manifest: development ? undefined : loadClientManifest(),
    pageStylesheets,
  }).tags;
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
    readStyles: islandCssReader(join(root, 'components', 'dehydrated-css')),
  });

  hbs.registerHelper(
    'assetHead',
    function assetHead(this: Record<string, unknown>): unknown {
      return new hbs.handlebars.SafeString(
        renderAssetHead(pageAssetTags(this, [])),
      );
    },
  );
  hbs.registerHelper(
    'assetScripts',
    function assetScripts(this: Record<string, unknown>): unknown {
      return new hbs.handlebars.SafeString(
        renderAssetScripts(pageAssetTags(this, islandNamesFrom(this))),
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
