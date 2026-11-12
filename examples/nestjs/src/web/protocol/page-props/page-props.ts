import type { PageStylesheetName } from '@archipielago/vite/asset-delivery/page-stylesheets.js';
import type { HomePageSsrProps } from './home-page.ssr-props.js';
import type { LoginPageSsrProps } from './login-page.ssr-props.js';
import type { RegisterPageSsrProps } from './register-page.ssr-props.js';

/**
 * View locals for each named page, keyed by the Handlebars view name.
 *
 * Controllers and `@Render` use this map so each page keeps its own props
 * type without a growing union on every call site. Add a key when scaffolding
 * a new page (under `protocol/page-props/`, not beside the view).
 */
export type SsrPagePropsMap = {
  home: HomePageSsrProps;
  login: LoginPageSsrProps;
  register: RegisterPageSsrProps;
};

/** Page names the Handlebars views know how to render. */
export type WebPageName = keyof SsrPagePropsMap;

/**
 * Locals a controller returns for one named view.
 *
 * Page fields stay on {@link SsrPagePropsMap}. `csrfToken` is a template local
 * for the layout meta tag. `pageStylesheets` opts the layout into sibling sheets.
 *
 * @template {WebPageName} K - Page key in {@link SsrPagePropsMap}.
 */
export type WebViewLocals<K extends WebPageName> = SsrPagePropsMap[K] & {
  csrfToken?: string;
  pageStylesheets: readonly PageStylesheetName[];
};
