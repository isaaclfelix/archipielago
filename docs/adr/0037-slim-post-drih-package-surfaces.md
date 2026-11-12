# ADR-0037: Slim post-Drih package surfaces

- **Status:** Accepted
- **Date:** 2026-11-12
- **Tags:** archipielago, packages, nestjs, islands

## Context

After Handlebars + Drih ([ADR-0035](./0035-handlebars-drih-islands.md)) and
dropping the injected islands table ([ADR-0036](./0036-drop-injected-islands-table.md)),
several package surfaces had no callers:

- `islandEntryRelPath` / `islandCssModulePath` / `islandManifestSourceKey` in
  `@archipielago/core` (kept briefly in ADR-0036; unused by Nest, vite, or
  react)
- Empty `ArchipielagoModule` in `@archipielago/nestjs` (the Nest example never
  imports it; HTML is Handlebars on the host)

Other Nest hosts may still need `mountArchipielagoAssets`. Host config
(`archipielago.config.ts` / `loadAndApplyArchipielagoConfig`) is hollow after
registration mode went away, but remains as the place to grow path and other
overrides later.

## Decision

- Delete the unused island path helpers and the `islands` module from
  `@archipielago/core`. Island folder names stay plain strings in
  `@archipielago/react` (optional `IslandName` alias there).
- Keep `@archipielago/core` config load/apply and path roots even when the
  config object has few keys today.
- Keep `@archipielago/nestjs` as a Nest host adapter package. Surface is
  `mountArchipielagoAssets` only; remove the empty Nest `@Module`.
- Keep `@archipielago/react` and `@archipielago/vite` as they are.

This amends [ADR-0036](./0036-drop-injected-islands-table.md) (path helpers no
longer stay) and the Nest adapter framing in
[ADR-0032](./0032-archipielago-pnpm-monorepo.md) (mount helper, not a DI
renderer module).

## Consequences

- Adding an island still needs no core path helper.
- Nest consumers depend on `@archipielago/nestjs` for asset mount only.
- Future config keys land in the existing config layer without reintroducing
  a package.

## Alternatives considered

- Delete `@archipielago/nestjs` and copy mount into the example — rejected;
  a second Nest host should depend on the adapter package.
- Delete hollow `config` until keys exist — rejected; the load/apply seam
  already exists and should survive for Phase 3 path overrides and later
  knobs.
- Fold `@archipielago/core` into `@archipielago/vite` — deferred; four
  package IDs remain until a second host proves otherwise.
