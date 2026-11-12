# ADR-0036: Drop the injected islands table

- **Status:** Accepted
- **Date:** 2026-11-12
- **Tags:** archipielago, islands, hydrate

## Context

[ADR-0028](./0028-island-filesystem-manifest.md) and
[ADR-0030](./0030-archipielago-host-config.md) kept an injected
`hasCssModule` table (`registerIslands`, `pnpm islands:sync`,
`islands.registration` auto vs manual) so engines could know island CSS
without reading the Vite tree. [ADR-0035](./0035-handlebars-drih-islands.md)
moved island CSS to a host sidecar and made the DOM the hydrate allowlist.
The Nest example stopped injecting the table. There is no second host.

Keeping `registerIslands(manifest)` “for other hosts” preserved a dead API
and a generated file nobody loaded.

## Decision

- Remove `registerIslands` / `getIslands` / `isIslandName` /
  `islandCssModuleUrl` and the generated `islands` map.
- Remove `pnpm islands:sync` and `islands.registration` (`auto` / `manual`).
- Conventional folders stay (`ui/islands/<name>/<name>.tsx`). Hydrate loaders
  come from the host Vite glob. The DOM is the allowlist; unknown names are
  skipped.
- Island CSS stays a sidecar `<style data-css-island>` from dehydrate, not a
  `hasCssModule` flag.
- Path helpers (`islandEntryRelPath`, `islandCssModulePath`,
  `setArchipielagoPaths`) stay. Host config path keys remain Phase 3.

This amends [ADR-0028](./0028-island-filesystem-manifest.md) (injected table
and sync) and [ADR-0030](./0030-archipielago-host-config.md) (registration
mode). Glob loaders, folder convention, and in-process path defaults remain.

## Consequences

- Adding an island is: conventional folder, `{{{hydrate "name"}}}`,
  `pnpm dehydrate`. No protocol table edit.
- A later host that wants a typed island name union can introduce one without
  reviving `hasCssModule`.
- Closed [TD-028](../known-tech-debt.md) resolution updates to this shape.

## Alternatives considered

- Keep `registerIslands` unused for a future host — rejected; the Nest
  example is the only host, and hydrate already treats the DOM as the
  allowlist.
- Keep `islands:sync` as documentation of discovered islands — rejected; the
  glob and the filesystem already are that list.
