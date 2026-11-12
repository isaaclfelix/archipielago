# ADR-0035: Handlebars document and prebuilt Drih islands

- **Status:** Accepted (amended by [ADR-0038](./0038-drop-drih-hydrate-from-nest-host.md))
- **Date:** 2026-11-12
- **Tags:** archipielago, nest, drih, handlebars

## Context

Request-time two-pass `renderToString` collected island names so the document
could emit hydrate scripts and sibling island CSS
([ADR-0011](./0011-two-pass-render-to-string.md)). That made Nest compile a
React document, an SSR bundle, and a generated islands manifest. Drih already
writes each island to HTML before the request. Hosts that do not monopolize the
frontend can include that HTML from a template. The Nest example is already
`NestExpressApplication`.

Cookie CSRF still belongs on the document
([ADR-0006](./0006-cookie-sessions-csrf.md)). An opaque `documentProps` bag
existed so packages would not name `csrfToken`
([ADR-0034](./0034-host-document-props.md)). That bag was a type hole
([TD-037](../known-tech-debt.md), [TD-038](../known-tech-debt.md)).

## Decision

- The Nest example’s **document is Handlebars**. Controllers use `@Render` and
  return typed view locals. Layout `views/layouts/app.hbs` owns chrome, the
  CSRF meta tag, and asset tags. Page bodies are `views/*.hbs`. Server chrome
  that is not interactive is a partial, as in the Laravel navbar.
- Islands are **prebuilt** by Drih (`drih-dehydrate` through the host Vite
  server) and included with `{{{hydrate "name"}}}`. The host prints the Drih
  shell: optional `<style data-css-island>` as the previous sibling of
  `<div data-component-name data-component-props>`. Compiled island CSS lives
  in a gitignored sidecar folder beside the dehydrated HTML. Drih does not
  compile SCSS.
- Archipielago **hydration stays lazy**. `hydrateIslands` scans
  `data-component-name`, parses `data-component-props`, and loads chunks from
  the island glob. The DOM is the allowlist. Unknown names are skipped. This
  host does not inject `islands.generated.ts` at bootstrap.
- Drop request-time `renderToString`, the `Island` marker, `entry-server`,
  `loadServerEntry`, the Vite SSR bundle, and `ArchipielagoViewService.render`.
  `createPageAssets` emits shell, opt-in page sheets, and the hydrate script
  when the include set is non-empty. It does not resolve island CSS.
- `csrfToken` is a **template local** on the same object as page fields
  (`WebViewLocals`). Packages do not name it.

This supersedes [ADR-0011](./0011-two-pass-render-to-string.md). It amends
island CSS delivery ([ADR-0015](./0015-island-css-sibling-style.md): the sibling
`<style>` still exists, from the host sidecar via the template helper, not from
a request-time Vite read) and document props
([ADR-0034](./0034-host-document-props.md): the opaque bag is gone on this
host). Islands remain the interactivity model
([ADR-0002](./0002-islands-ssr-ui.md)); the document is no longer a React tree.

## Consequences

- Guest-only redirects stay in the controller. Desktop logout stays an island
  because it calls the JSON logout endpoint.
- `pnpm dehydrate` is a lifecycle step before start, e2e, and build. Missing
  HTML prints an empty include (no shell).
- TD-037 and TD-038 close: there is no `documentProps` bag and no SSR entry
  whose props Nest cannot see.
- A later Express example may use EJS without inheriting `@drih/handlebars`
  from `@archipielago/nestjs`.
- Laravel stays on Blade. Publishing `@drih` and swapping local `link:`
  overlays is a follow-up, not this change.

## Alternatives considered

- Keep two-pass React SSR and only dehydrate islands — rejected; Nest would
  still own a React document and an SSR bundle.
- Mix dehydrated HTML into React pages via `dangerouslySetInnerHTML` —
  rejected; the template already is the document.
- Switch hydrate to Drih’s eager `virtual:client-components` — rejected; it
  would download unused island chunks ([ADR-0002](./0002-islands-ssr-ui.md)).
- Put island CSS in the dehydrated HTML folder — rejected; Drih stays
  HTML-only. The host sidecar is a sibling directory.
