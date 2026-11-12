# ADR-0038: Drop Drih hydrate from the Nest host

- **Status:** Accepted
- **Date:** 2026-11-12
- **Tags:** archipielago, nest, drih, islands

## Context

[ADR-0035](./0035-handlebars-drih-islands.md) kept Drih dehydration and
Handlebars inclusion, and kept Archipielago hydration lazy. The Nest example
still registered `@drih/hydrate`'s Vite plugin and marked island entries
`'use client'`. Nothing imported `virtual:client-components` or
`hydrateComponents`. The nested island folder
(`ui/islands/<name>/<name>.tsx`) is already the allowlist for both
`drih-dehydrate` and `hydrateIslands`.

`readIslandCss` lived on the Nest view setup even though the sidecar files are
written by `@archipielago/vite`. `ArchipielagoPaths` still carried
`islandsDirRel` and `islandsDirDevPrefix`, which no caller read.
`@archipielago/react` still depended on `@archipielago/core` after `IslandName`
moved into the react package.

## Decision

- Island entries are `<name>/<name>.tsx` with a default export. This host does
  not use `'use client'` or `@drih/hydrate`. Keep `@drih/dehydrate`,
  `dehydratePlugin()`, and `@drih/handlebars`.
- `islandCssReader(sidecarDir)` in `@archipielago/vite` is the `readStyles`
  callback. The Nest example passes
  `views/components/dehydrated-css`. Drih still does not know that directory.
- Drop `islandsDirRel` and `islandsDirDevPrefix`. Shell, hydrate-entry, and
  client-output paths stay. Island folders remain the host Vite config and the
  product glob.
- `@archipielago/react` does not depend on `@archipielago/core`.

This amends [ADR-0035](./0035-handlebars-drih-islands.md) (the Nest host does
not register Drih's hydrate plugin). It does not change Drih's own `'use
client'` contract for hosts that still call `hydrateComponents`.

## Consequences

- A new island does not start with `'use client'`. The scaffold matches that.
- Missing or empty sidecar CSS still prints the wrapper alone.
- Host config load/apply stays, including the hollow
  `archipielago.config.ts` loader ([ADR-0037](./0037-slim-post-drih-package-surfaces.md)).

## Alternatives considered

- Keep the directive so the file still matches a pure Drih client component —
  rejected; this host never hydrates through Drih, and the directive only
  existed to feed that plugin.
- Teach Drih the sidecar directory — rejected; `readStyles` stays the host
  hook, and the reader moves into the package that writes the file.
- Delete hollow host config — rejected; the load/apply seam remains for later
  path overrides.
