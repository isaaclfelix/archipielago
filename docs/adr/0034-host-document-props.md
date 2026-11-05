# ADR-0034: Host document props on the SSR entry

- **Status:** Accepted
- **Date:** 2026-11-04
- **Tags:** archipielago, ssr, packages

## Context

Phase 2 left `@archipielago/*` as private workspace packages whose later npm
publish should be mechanical ([ADR-0032](./0032-archipielago-pnpm-monorepo.md)).
The SSR seam still named `csrfToken` on `ServerEntry`, `renderDocument`, and
`ArchipielagoViewService`.

Cookie sessions and the `<meta name="csrf-token">` tag are the Nest example’s
behavior ([ADR-0006](./0006-cookie-sessions-csrf.md)). A second host should not
inherit that field name, and the packages must not import the example to
supply it.

## Decision

- Extra data for the product document shell travels as an opaque
  `documentProps` object on `ServerEntry.render`, `renderDocument`, and
  `ArchipielagoViewService.render`.
- Engines forward that bag onto the host `Document`. They do not name product
  session or CSRF fields, and they do not read the bag.
- The Nest example keeps the meta tag in its `Document`. `WebController`
  passes `{ csrfToken }` inside `documentProps`; `entry-server` forwards it.

## Consequences

- A host that needs head data puts it on its own document props. The published
  contract stays free of the dogfood session model.
- Nest-sample path defaults stay as they are until a second host forces them
  onto host config ([ADR-0030](./0030-archipielago-host-config.md)).
- In-repo callers were the only consumers. The example moved in the same
  change set. Packages remain `private` and `0.0.0`.

## Alternatives considered

- Keep a named `csrfToken` argument on the engine API — rejected; it publishes
  a product concern as part of Archipielago.
- Read the session from async request storage inside `entry-server` — rejected;
  it hides the data path and ties SSR to a Node request store.
- Put the token on every page’s SSR props — rejected; page props feed the page
  body, not the document shell.
