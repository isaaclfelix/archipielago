import {
  setPageStylesheetRegistry,
  type PageStylesheetName,
} from '@archipielago/vite/asset-delivery/page-stylesheets.js';
import type { WebPageName } from './protocol/page-props/page-props.js';

/**
 * Stylesheets each named page opts into for this Nest sample.
 *
 * Empty means shell only (island CSS comes from the Drih sidecar include).
 * Login/register opt into `forms`.
 */
export const pageStylesheetsByPage: Record<
  WebPageName,
  readonly PageStylesheetName[]
> = {
  home: [],
  login: ['forms'],
  register: ['forms'],
};

/**
 * Registers this app's opt-in page stylesheet ids with Archipielago.
 *
 * Call from process bootstrap before the first HTML render that needs sibling
 * sheets. Paths stay app-owned (not Archipielago path defaults).
 *
 * @returns {void}
 */
export function registerAppPageStylesheets(): void {
  setPageStylesheetRegistry({
    forms: {
      source: 'src/web/ui/styles/forms.scss',
      devUrl: '/src/web/ui/styles/forms.scss',
    },
  });
}
