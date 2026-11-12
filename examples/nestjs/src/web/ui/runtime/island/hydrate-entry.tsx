import { hydrateIslands } from '@archipielago/react/runtime/island/hydrate';
import './island-modules';

/**
 * Browser hydrate entry for this Nest sample app.
 *
 * Registers the island module glob, then hydrates Drih wrappers found in the
 * document. The DOM is the allowlist; unknown names are skipped.
 */
await hydrateIslands();
