/**
 * Vitest setup: inject the island module glob and page stylesheet registry.
 *
 * Re-registers in `beforeEach` so package fixture specs that overwrite the
 * process-global modules (e.g. `@archipielago/react` hydrate tests) cannot
 * leak into later Nest product specs in the same worker.
 */
import { beforeEach } from 'vitest';
import { registerAppPageStylesheets } from '../src/web/page-stylesheets.js';
import { registerAppIslandModules } from '../src/web/ui/runtime/island/island-modules.js';

registerAppPageStylesheets();
registerAppIslandModules();

beforeEach(() => {
  registerAppPageStylesheets();
  registerAppIslandModules();
});
