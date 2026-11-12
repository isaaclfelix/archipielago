import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Builds the Drih `readStyles` callback for one sidecar directory.
 *
 * A missing or empty file means the island has no module sheet, so the
 * template helper prints the wrapper without a style sibling.
 *
 * @param {string} sidecarDir - Directory of `<name>.css` files.
 * @returns {(name: string) => string | undefined} Reader for one component name.
 */
export function islandCssReader(
  sidecarDir: string,
): (name: string) => string | undefined {
  return (name: string): string | undefined => {
    const filePath = join(sidecarDir, `${name}.css`);

    if (!existsSync(filePath)) {
      return undefined;
    }

    const css = readFileSync(filePath, 'utf8');
    return css === '' ? undefined : css;
  };
}
