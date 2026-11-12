---
name: create-web-ui
description: >-
  Scaffold Nest Handlebars pages or interactive islands under examples/nestjs.
  Use when the user asks to add UI, a page section, a component, an island, web
  styles, or “scaffold web UI.” Follows docs/how-to-web-ui.md; refuses
  CSS-module and island-only-for-styling anti-patterns.
---

# Create Web UI

Bootstrap HTML UI in the Nest example (`examples/nestjs`) **without inventing a parallel CSS or island pattern**. Source of truth for the decision tree: [docs/how-to-web-ui.md](../../../docs/how-to-web-ui.md). Delivery mechanics: [examples/nestjs/docs/architecture.md](../../../examples/nestjs/docs/architecture.md) (Styles). Layout: Nest thin `web.*` + `@archipielago/nestjs`, Vite `ui/`, Handlebars `views/`, wire `protocol/` ([ADR-0023](../../../docs/adr/0023-web-host-ui-protocol.md), [ADR-0032](../../../docs/adr/0032-archipielago-pnpm-monorepo.md), [ADR-0035](../../../docs/adr/0035-handlebars-drih-islands.md)). Relative imports under `examples/nestjs/src/web/ui/` are **extensionless** ([ADR-0024](../../../docs/adr/0024-dual-import-resolution.md)); do not emit Nest-style `.js` suffixes into UI stubs. Components live in **per-component folders** with thin `index.ts` barrels ([ADR-0025](../../../docs/adr/0025-per-component-folders.md)). Scaffold also emits a colocated Storybook stub for islands ([ADR-0026](../../../docs/adr/0026-storybook-ui-workshop.md)). Imports that leave a component folder use `@ui` / `@protocol` / `@api` ([ADR-0027](../../../docs/adr/0027-ui-path-aliases.md)); engines use `@archipielago/*` **package** imports.

Prefer the shared scaffolder so humans and agents stay aligned (from the repo root):

```bash
pnpm scaffold:web-ui --name <kebab> --mode page|island [--with-styles]
```

Implementation: [examples/nestjs/scripts/scaffold-web-ui.ts](../../../examples/nestjs/scripts/scaffold-web-ui.ts). Run that script (or apply the **same** file edits it would). Do not hand-roll a different CSS delivery path.

## Ask before writing

Unless the user already answered, ask these in order:

1. **Does this need client interactivity** (state, events, browser APIs)?
   - **No** → Handlebars page under `examples/nestjs/views/<name>.hbs` + locals under `examples/nestjs/src/web/protocol/page-props/`. Shell classes only. **Refuse** `*.module.scss` and `{{{hydrate}}}` “for styling.”
   - **Yes** → island folder under `examples/nestjs/src/web/ui/islands/<name>/`; then ask (2).
2. **Does it need interaction-specific styles** beyond the shell (hover, spinner, open state)?
   - **No** → island folder only; style with shell classes (`--mode island` without `--with-styles`).
   - **Yes** → also add colocated `*.module.scss` (`--with-styles`).

Map answers to the CLI:

| Answers                        | Command                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| No interactivity               | `pnpm scaffold:web-ui --name … --mode page`                 |
| Interactive, shell styles only | `pnpm scaffold:web-ui --name … --mode island`               |
| Interactive + module styles    | `pnpm scaffold:web-ui --name … --mode island --with-styles` |

## Must refuse / redirect

- **Static page + CSS module** — extend the shell, or promote to an island because it will gain interaction. Never `--mode page --with-styles`.
- **Island only to attach CSS** (no interactive JS) — style with the shell; do not wrap static markup in `{{{hydrate}}}`.
- Re-importing shell / Bootstrap **component** SCSS into an island module (tokens-only via `ui/styles/_tokens.scss`).
- Growing a utility layer or mini-Bootstrap inside island modules.
- A second CSS delivery path (head links per island, CSS only after chunk load, skipping sibling `<style>` inlining).
- Shipping the Bootstrap Icons webfont, or pasting one-off SVGs into an island — register glyphs in `examples/nestjs/src/web/ui/shared-components/icon/` instead ([how-to-web-ui.md § Icons](../../../docs/how-to-web-ui.md#icons)).
- Putting Nest view locals beside the view under `views/` (use `protocol/page-props/*-page.locals.ts`).
- Fat composition barrels or component-as-only-`index.tsx`.

## After scaffolding

**Page:** scaffolder writes `protocol/page-props/<name>-page.locals.ts` (`*PageLocals`) + `views/<name>.hbs` under `examples/nestjs/`. Then register in `protocol/page-props/page-props.ts` (`PageLocalsMap` / `WebPageName`) and a `WebController` method that imports **locals types only** from protocol (never island `.tsx`) and uses `@Render`. Style with shell classes only. Read the [view locals quirk](../../../docs/how-to-web-ui.md#view-locals-quirk).

**Island:** include `{{{hydrate "name"}}}` from a Handlebars view or partial. Scaffold writes the conventional `'use client'` folder + stories stub. Then run `pnpm dehydrate` so gitignored HTML and CSS sidecars exist. Hydrate loaders come from the registry glob. The helper inlines CSS as a sibling `<style data-css-island>`; hydrate loads JS only ([ADR-0028](../../../docs/adr/0028-island-filesystem-manifest.md), [ADR-0035](../../../docs/adr/0035-handlebars-drih-islands.md), [ADR-0036](../../../docs/adr/0036-drop-injected-islands-table.md)).

**Tests ([ADR-0021](../../../docs/adr/0021-vitest-browser-ui-testing.md)):** interactive islands need a co-located `*.spec.ts` in the Vitest browser project (Testing Library). Pages/islands that navigate or call the API also need browser e2e coverage (`*.browser-e2e-spec.ts`). Do not defer that to out-of-repo QA ([TD-026](../../../docs/known-tech-debt.md)).

**Storybook ([ADR-0026](../../../docs/adr/0026-storybook-ui-workshop.md)):** browse island stubs with `pnpm storybook`. Workshop only — not a Vitest replacement and not Chromatic.

Run `pnpm lint` (and `pnpm build` if signatures/modules changed) after edits. Commit only when the user asks or AGENTS.md incremental commits applies — use the `create-commit` skill.
