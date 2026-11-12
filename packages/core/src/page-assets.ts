/** One `<style>` block to emit in the document head (e.g. inlined shell). */
export interface InlineStyleTag {
  id: string;
  css: string;
}

/**
 * Stylesheets, head inlines, and module scripts the document shell should emit.
 *
 * Empty lists mean the page ships no client assets of that kind.
 */
export interface AssetTags {
  stylesheets: string[];
  inlineStyles: InlineStyleTag[];
  scripts: string[];
}

/**
 * Document tags for one HTML response.
 *
 * Island CSS is not in this bag. The host prints island `<style data-css-island>`
 * from prebuilt sidecar files when it includes a dehydrated island.
 */
export interface PageAssets {
  tags: AssetTags;
}

/** No client JavaScript and no stylesheets. */
export const emptyAssetTags: AssetTags = {
  stylesheets: [],
  inlineStyles: [],
  scripts: [],
};
