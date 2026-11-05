import type { PageAssets } from './page-assets.js';
import type { RenderResult } from './render-result.js';

export type { RenderResult } from './render-result.js';

/**
 * Host-owned map of page name → SSR embed props.
 *
 * Product apps define a concrete map (for example Nest `SsrPagePropsMap`).
 * Core stays free of app page-prop modules ([ADR-0032](../../../docs/adr/0032-archipielago-pnpm-monorepo.md)).
 */
export type PagePropsMap = Record<string, object>;

/**
 * Server render function implemented by the Vite SSR bundle (`entry-server`).
 *
 * Page prop types stay app-owned. `documentProps` is an opaque bag for the
 * host document shell. Core forwards it and does not name product fields.
 * Returns a full-document {@link RenderResult}.
 *
 * @template {PagePropsMap} TPages - Host page name → props map.
 */
export interface ServerEntry<TPages extends PagePropsMap = PagePropsMap> {
  /**
   * Renders one host page to a full HTML document.
   *
   * The host owns page props and any extra document-shell fields. Callers
   * pass those fields as `documentProps`; this contract does not interpret
   * them.
   *
   * @template {keyof TPages & string} K - Page key in the host map.
   * @param {K} page - Host page name.
   * @param {TPages[K]} props - SSR embed props for that page.
   * @param {(islandNames: string[]) => PageAssets | Promise<PageAssets>} createAssets -
   * Builds tags after island names are known.
   * @param {object} [documentProps] - Opaque props for the host document shell.
   * @returns {Promise<RenderResult>} Full document HTML plus the asset bag.
   */
  render<K extends keyof TPages & string>(
    page: K,
    props: TPages[K],
    createAssets: (islandNames: string[]) => PageAssets | Promise<PageAssets>,
    documentProps?: object,
  ): Promise<RenderResult>;
}
