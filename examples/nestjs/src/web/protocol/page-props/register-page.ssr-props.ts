/**
 * View locals for the register page (`views/register.hbs`).
 *
 * Built by Nest (`WebController`) and passed to Handlebars. JSON-serializable
 * only. Not colocated with the view on purpose — see ADR-0023 / how-to-web-ui.
 *
 * Guest-only: the controller redirects authenticated sessions to `/` before
 * render.
 */
export interface RegisterPageSsrProps {
  /** Always false when this page is rendered (guest-only route). */
  isAuthenticated: boolean;
}
