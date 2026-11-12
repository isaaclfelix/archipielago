# Authoring

Post-connect **quick reference** for product UI once Archipielago is wired
(Nest recipe or DIY). Use it when adding pages or islands: what the framework
requires, what the host owns, and the CSS-only-island anti-pattern.

Related pages:

- Prereq (pages already rendering): [nestjs.md](./nestjs.md) or
  [wiring.md](./wiring.md)
- Still integrating a non-Nest host? [wiring.md](./wiring.md)
- Nest demonstration / recipe: [nestjs.md](./nestjs.md)
- Nest-example / dogfood website UI conventions (including that site’s CSS
  lanes): [how-to-web-ui.md](../../how-to-web-ui.md)

## Interactivity boundary

| Need                                                      | Prefer                                             |
| --------------------------------------------------------- | -------------------------------------------------- |
| Static markup (no client state, no hydrate-worthy events) | Page view or partial in the host templates         |
| Client interactivity (`useState`, clicks, browser APIs)   | An **island** included with `{{{hydrate "name"}}}` |

Using an Archipielago island for CSS-only optimization is an anti-pattern: a
non-interactive component does not need a CSS module imported through an island
and then injected as a sibling style tag. Style tags or linked stylesheets can
already load from the document.

## Islands (required shape)

Islands are a **hard contract** with hydrate loaders and optional CSS sibling
tags. The relative layout is always `ui/islands/<name>/<name>.tsx`—not a knob
on `archipielago.config.ts`. Hosts may mount product UI under a packaging
prefix (for example `src/web/…`) via path defaults or `setArchipielagoPaths`;
the `ui/islands/…` segment itself stays fixed.

```text
ui/islands/
  login-form/
    login-form.tsx              # required: default export; file name === folder name
  mobile-navigation/
    mobile-navigation.tsx       # required: default export; file name === folder name
    mobile-navigation.module.scss   # optional: island-owned CSS module
```

Rules that follow from that layout:

- One folder per island; the implementation file must be
  `<name>/<name>.tsx` with a **default export**. Hydrate discovers modules via a
  glob of that pattern (stories/specs are not island entry files). Do not mark
  the file `'use client'` ([ADR-0038](../../adr/0038-drop-drih-hydrate-from-nest-host.md)).
- Include it from a template with `{{{hydrate "name"}}}` (and optional hash
  args). Then run `pnpm dehydrate` so the gitignored HTML sidecar exists.
- Props on the wrapper must be JSON-serializable; hydrate loads JS for named
  wrappers only. Unknown names are skipped.
- If `<name>.module.scss` is present, the sidecar plugin writes compiled CSS.
  Pass `islandCssReader` to the hydrate helper so the first include prints a
  sibling `<style data-css-island="{name}">` (hydrate still loads JS only).

From a Handlebars view or partial:

```hbs
{{{hydrate 'login-form' nextPath='/users'}}}
```

The `name` must match the folder. Hosts often add a thin `index.ts` barrel,
tests, or stories beside these files; those extras are fine as long as the
`<name>/<name>.tsx` (+ optional module) contract stays intact.

## Pages (host-owned)

Pages are host templates. They are **not** bound to the island filesystem
contract. Put them where the view engine expects (`views/<name>.hbs` in the
Nest example). Chrome that is not interactive is a partial.

How you deliver non-island CSS (document shell, page-level sheets, etc.) is also
host policy—not an Archipielago authoring requirement.

## View locals stay outside templates

View locals are a host→template **embed contract**, not React parent props:

- Host builds plain, JSON-serializable data.
- When dual TypeScript ownership applies, the host HTTP graph must not import
  island `.tsx` modules.
- Keep prop types in a host-owned protocol (or similar) folder—not colocated
  under the view files. [Learn why](../../adr/0023-web-host-ui-protocol.md).

Island props remain separate (component props + `data-component-props` on the
wrapper).

Shell fields (meta tags, request-scoped head data) are template locals on the
same object the controller returns.
[Learn how](./concepts.md#template-locals-vs-island-props).
