import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { decodeComponentProps } from './island-props';
import { getIslandLoaders } from './registry';

/**
 * Hydrates each Drih island wrapper in `root`.
 *
 * Loads only the chunks named in the document. Other glob entries stay
 * unrequested. The wrapper element is the container, not part of the
 * component tree. Unknown names are skipped so the DOM stays the allowlist.
 *
 * @param {ParentNode} [root] - Document or fragment to scan. Defaults to `document`.
 * @returns {Promise<void>} Resolves when every known wrapper on the page has been hydrated.
 */
export async function hydrateIslands(
  root: ParentNode = document,
): Promise<void> {
  const islandLoaders = getIslandLoaders();
  const nodes = [
    ...root.querySelectorAll<HTMLElement>('[data-component-name]'),
  ];

  await Promise.all(
    nodes.map(async (node) => {
      const name = node.dataset.componentName ?? '';
      const load = islandLoaders[name];

      // The DOM is the allowlist. A name without a glob loader is skipped.
      if (load === undefined) {
        return;
      }

      const props = decodeComponentProps(node.dataset.componentProps ?? '');
      const islandModule = await load();

      hydrateRoot(node, createElement(islandModule.default, props));
    }),
  );
}
