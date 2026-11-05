import type { ComponentType, ReactElement, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import type { IslandName } from '@archipielago/core/islands';
import type { PageAssets } from '@archipielago/core/page-assets';
import type { RenderResult } from '@archipielago/core/render-result';
import { IslandCssContext, IslandNamesContext } from '../island/island';

/**
 * Props for the product document shell around a rendered page.
 *
 * Host-only fields travel as a generic extra on {@link RenderDocumentOptions},
 * not as named properties here.
 */
export interface DocumentShellProps {
  children: ReactNode;
  assets: PageAssets['tags'];
}

/**
 * Options for the Nest-free two-pass document render.
 *
 * @template {object} TExtra - Opaque props the host document shell accepts.
 */
export interface RenderDocumentOptions<
  TExtra extends object = Record<string, never>,
> {
  /** Renders the selected page (app supplies the component + props). */
  renderPage: () => ReactElement;
  /** Product HTML document shell (title, branding, asset slots). */
  Document: ComponentType<DocumentShellProps & TExtra>;
  /** Builds tags and island CSS after the name-collection pass. */
  createAssets: (islandNames: string[]) => PageAssets | Promise<PageAssets>;
  /** Opaque props forwarded to {@link Document}. The engine does not read them. */
  documentProps?: TExtra;
}

/**
 * Builds the props object passed to the host document shell.
 *
 * Asset tags always come from the engine. Host extras are copied through
 * when the caller provided them, and an omitted bag leaves only those tags.
 *
 * @template {object} TExtra - Opaque props the host document shell accepts.
 * @param {PageAssets['tags']} assets - Stylesheet, script, and inline style tags.
 * @param {TExtra} [documentProps] - Opaque props forwarded from the caller.
 * @returns {Omit<DocumentShellProps, 'children'> & TExtra} Shell props without children.
 */
function documentShellProps<TExtra extends object>(
  assets: PageAssets['tags'],
  documentProps?: TExtra,
): Omit<DocumentShellProps, 'children'> & TExtra {
  // The spread is the host bag plus engine tags. Children stay JSX children.
  return {
    assets,
    ...documentProps,
  } as Omit<DocumentShellProps, 'children'> & TExtra;
}

/**
 * Renders a page tree to a full HTML document via two-pass SSR.
 *
 * Pass 1 collects island names. Pass 2 uses framework-built page assets and
 * emits sibling island `<style>` tags. The product {@link Document} stays
 * injectable; Archipielago owns the document contract (doctype + asset wiring).
 * Extra document fields stay on `documentProps` and are spread onto the shell.
 *
 * @template {object} TExtra - Opaque props the host document shell accepts.
 * @param {RenderDocumentOptions<TExtra>} options - Page factory, Document, assets.
 * @returns {Promise<RenderResult>} Full document HTML plus the asset bag used.
 */
export async function renderDocument<
  TExtra extends object = Record<string, never>,
>(options: RenderDocumentOptions<TExtra>): Promise<RenderResult> {
  const { renderPage, Document, createAssets, documentProps } = options;
  const islandNames = new Set<string>();

  // First pass records island names. Asset URLs depend on that set.
  renderToString(
    <IslandNamesContext.Provider value={islandNames}>
      {renderPage()}
    </IslandNamesContext.Provider>,
  );

  const assets = await createAssets([...islandNames]);
  const { tags, islandCss } = assets;
  const emitted = new Set<IslandName>();

  // Second pass forwards host document props without reading them.
  const markup = renderToString(
    <IslandCssContext.Provider value={{ cssByName: islandCss, emitted }}>
      <Document {...documentShellProps(tags, documentProps)}>
        {renderPage()}
      </Document>
    </IslandCssContext.Provider>,
  );

  return {
    html: `<!DOCTYPE html>${markup}`,
    assets,
  };
}
