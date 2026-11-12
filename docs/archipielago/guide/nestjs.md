# NestJS example

Demonstration and documented Nest host recipe.
[examples/nestjs](../../../examples/nestjs) shows the concepts connected end to
end—and is also the host for the future dogfood website. This page maps those
pieces onto Nest files; it does **not** redefine the primitives.

Related pages:

- Before this: [install.md](./install.md)
- Primitives: [concepts.md](./concepts.md)
- Runbook (database, start, URLs):
  [examples/nestjs/README.md](../../../examples/nestjs/README.md)

| Wiring step      | Nest example                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Packages         | `@archipielago/{core,react,vite,nestjs}` plus `hbs` and `@drih/{dehydrate,hydrate,handlebars}` |
| Product UI       | `examples/nestjs/src/web/ui/islands/**`                                                        |
| Page views       | `examples/nestjs/views/**`                                                                     |
| View locals      | `examples/nestjs/src/web/protocol/page-props/**`                                               |
| Config           | `examples/nestjs/archipielago.config.ts`                                                       |
| Page stylesheets | `examples/nestjs/src/web/page-stylesheets.ts` (called from `configureWebViews`)                |
| Island glob      | `examples/nestjs/src/web/ui/runtime/island/island-modules.ts` (hydrate entry + Vitest setup)   |
| Hydrate entry    | `examples/nestjs/src/web/ui/runtime/island/hydrate-entry.tsx`                                  |
| Vite             | `examples/nestjs/vite.config.ts` + Archipielago and Drih plugins                               |
| Mount assets     | `mountArchipielagoAssets(app)` in `examples/nestjs/src/main.ts`                                |
| Routes → HTML    | `WebController` `@Render` + Handlebars locals                                                  |

## Adapter surface

- **`mountArchipielagoAssets(app)`** — static client root in production; Vite
  middleware in development.
- HTML is Handlebars on the host, not an injectable renderer. See
  [ADR-0035](../../adr/0035-handlebars-drih-islands.md).

Nest types stay out of `@archipielago/core`, `react`, and `vite`.

## CSRF and other template locals

`csrfToken` is a field on `WebViewLocals`. The layout prints
`<meta name="csrf-token">` when it is set. Packages do not name that field
([ADR-0035](../../adr/0035-handlebars-drih-islands.md)).

From a controller:

```ts
@Get()
@Render('home')
home(@Req() req: RequestWithSession): WebViewLocals<'home'> {
  return {
    renderedAt: new Date().toISOString(),
    isAuthenticated: Boolean(req.session?.userId),
    csrfToken: req.session?.csrfToken,
    pageStylesheets: pageStylesheetsByPage.home,
  };
}
```

The current-state map is
[examples/nestjs/docs/architecture.md](../../../examples/nestjs/docs/architecture.md#csrf-and-other-template-locals).

## Commands (from repo root)

| Task       | Command                                                |
| ---------- | ------------------------------------------------------ |
| Dev server | `pnpm start:dev`                                       |
| Build      | `pnpm build`                                           |
| Unit tests | `pnpm test`                                            |
| E2E        | `pnpm test:e2e`                                        |
| Dehydrate  | `pnpm --filter @archipielago/example-nestjs dehydrate` |
| Storybook  | `pnpm storybook`                                       |

Root scripts filter into `@archipielago/example-nestjs`. Shared lint/format/CI
stay at the monorepo root. [Learn why](../../adr/0032-archipielago-pnpm-monorepo.md).

## Next steps

- **Nest as your host** — keep [authoring.md](./authoring.md) for page vs island.
  Folder conventions, CSS lanes, and scaffold for this example’s UI style:
  [how-to-web-ui.md](../../how-to-web-ui.md) (maintainer cookbook; use it if you
  follow our patterns).
- **Another host** — transfer the same contract with [wiring.md](./wiring.md),
  then [authoring.md](./authoring.md).
