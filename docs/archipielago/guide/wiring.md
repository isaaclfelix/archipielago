# Wiring

Ordered, **host-agnostic** steps to embed Archipielago in a host that is not
(or not only) the Nest recipe. Replace “host” with your HTTP framework.

Related pages:

- Prefer seeing Nest first: [nestjs.md](./nestjs.md)
- Primitives: [concepts.md](./concepts.md)
- After HTML renders: [authoring.md](./authoring.md)

## Host owns vs package owns

| Step                                       | Host                             | Package                                            |
| ------------------------------------------ | -------------------------------- | -------------------------------------------------- |
| Paths / `archipielago.config.ts`           | Yes                              | `core` reads applied config / path getters         |
| `setIslandModules(import.meta.glob)`       | Yes (Vite file under product UI) | `react` builds loaders                             |
| Page stylesheet registry + per-page opt-in | Yes                              | `vite` emits `<link>`s                             |
| Document templates + island includes       | Yes                              | Drih writes HTML; host helper prints the shell     |
| Vite config plugins / inputs               | Yes (app Vite config)            | `vite` plugins                                     |
| Mount middleware / static                  | Yes (call helper or DIY)         | `vite` pipeline; Nest adapter ships a mount helper |
| HTTP route → locals → HTML                 | Yes                              | Host view engine                                   |

## Steps

1. **Depend** on `core`, `react`, `vite` (+ host adapter if one exists),
   plus Drih dehydrate/hydrate packages the host template engine needs.
   [install.md](./install.md).

2. **Layout product UI** with conventional islands:
   `ui/islands/<name>/<name>.tsx` (+ optional `<name>.module.scss`).
   Keep page props under a host-owned protocol folder. Keep the document in
   the host’s templates.

3. **Config** — optional `archipielago.config.ts` with
   `islands.registration: 'auto' | 'manual'`. Path overrides via
   `setArchipielagoPaths` when cwd defaults are wrong.

4. **Bootstrap registration**
   - `setPageStylesheetRegistry({ ... })` when using sibling sheets
   - Import the Vite file that calls `setIslandModules(...)` (browser hydrate
     entry; Vitest setup for unit tests)

5. **Document** — host templates own chrome, CSRF meta, and asset tags.
   Include islands with the Drih helper for that engine (`{{{hydrate "name"}}}`
   in Handlebars). Pass request fields as template locals, not as a package
   `documentProps` bag ([concepts](./concepts.md#template-locals-vs-island-props)).

6. **Hydrate entry** — set the island glob, then `hydrateIslands()`.

7. **Vite** — client inputs (hydrate, shell CSS, opt-in sheets), Archipielago
   and Drih Vite plugins, aliases for product zones. There is no SSR bundle.

8. **HTTP mount** — production: static `clientAssetsRoot()`; development:
   `createDevAssetPipeline()` middleware. Do this once at process boot.

9. **Request path** — for each HTML route, build view locals and `@Render`
   (or the host equivalent). Return `text/html`.

10. **Lifecycle** — run `drih-dehydrate` before start, e2e, and build so
    gitignored island HTML and CSS sidecars exist.

## Done when

The same product islands can render through the host without host framework
types inside `core` / `react` / `vite`, and asset URLs work in both Vite
middleware and production static modes.

Smoke check: one template-only page and one island include. Then keep
[authoring.md](./authoring.md) for page vs island and props.
