import type { PageStylesheetName } from '@archipielago/vite/asset-delivery/page-stylesheets.js';
import type { HomePageLocals } from './home-page.locals.js';
import type { LoginPageLocals } from './login-page.locals.js';
import type { RegisterPageLocals } from './register-page.locals.js';

/**
 * View locals for each named page, keyed by the Handlebars view name.
 *
 * Controllers and `@Render` use this map so each page keeps its own locals
 * type without a growing union on every call site. Add a key when scaffolding
 * a new page (under `protocol/page-props/`, not beside the view).
 */
export type PageLocalsMap = {
  home: HomePageLocals;
  login: LoginPageLocals;
  register: RegisterPageLocals;
};

/** Page names the Handlebars views know how to render. */
export type WebPageName = keyof PageLocalsMap;

/**
 * Locals a controller returns for one named view.
 *
 * Page fields stay on {@link PageLocalsMap}. `csrfToken` is a template local
 * for the layout meta tag. `pageStylesheets` opts the layout into sibling sheets.
 *
 * @template {WebPageName} K - Page key in {@link PageLocalsMap}.
 */
export type WebViewLocals<K extends WebPageName> = PageLocalsMap[K] & {
  csrfToken?: string;
  pageStylesheets: readonly PageStylesheetName[];
};
