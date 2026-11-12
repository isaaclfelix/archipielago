/**
 * View locals for the home page (`views/home.hbs`).
 *
 * Built by Nest (`WebController`) and passed to Handlebars. JSON-serializable
 * only. Not colocated with the view on purpose — see ADR-0023 / how-to-web-ui.
 */
export interface HomePageSsrProps {
  renderedAt: string;
  /** True when the request session is bound to a user. */
  isAuthenticated: boolean;
}
