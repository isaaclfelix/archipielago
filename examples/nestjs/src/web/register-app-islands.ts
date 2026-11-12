import { registerAppPageStylesheets } from './page-stylesheets.js';

/**
 * Registers this app's opt-in page stylesheet ids with Archipielago.
 *
 * Island names are not injected here. The DOM is the allowlist and the Vite
 * glob is the lazy loader map. Call from process bootstrap before the first
 * HTML render that needs sibling sheets.
 *
 * @returns {void}
 */
export function registerAppIslands(): void {
  registerAppPageStylesheets();
}
