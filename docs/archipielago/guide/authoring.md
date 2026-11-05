# Authoring

Post-connect **quick reference** for product UI once Archipielago is wired
(Nest recipe or DIY). Use it when adding SSR-only pieces or islands: what the
framework requires, what the host owns, and the CSS-only-island anti-pattern.

Prereq: [nestjs.md](./nestjs.md) or [wiring.md](./wiring.md) done so pages
render through the host.

## Interactivity boundary

| Need                                                                 | Prefer                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Static / SSR-only markup (no client state, no hydrate-worthy events) | Page or server-rendered child in the host product UI tree              |
| Client interactivity (`useState`, clicks, browser APIs)              | An **island** registered with Archipielago and rendered via `<Island>` |

Using an Archipielago Island for CSS-only optimization meant for an islands
architecture is an anti-pattern: a non-interactive component doesn't need a CSS
style imported through an Island and then injected as a sibling style tag
through the framework's runtime. Style tags or linked stylesheets can be loaded
from the SSR side already.

## Islands (required shape)

Islands are a **hard contract** with registration, hydrate loaders, and optional
CSS sibling tags. Follow this shape:

- Folder under the host’s configured islands root, typically
  `ui/islands/<name>/`, with a default-export implementation (and optional
  colocated `*.module.scss`).
- Registration via the host’s island manifest / `registerIslands` (auto sync or
  manual ownership). [Learn why](../../adr/0028-island-filesystem-manifest.md)
  · [See more](../../adr/0030-archipielago-host-config.md).
- JSON-serializable props on the `<Island>` marker; hydrate loads JS for named
  islands only.
- When an island has CSS module styles, the runtime **always** inlines them as
  sibling `<style data-css-island>` tags at SSR (hydrate still loads JS only).

Render islands with `<Island name="…" component={…} props={…} />` from
`@archipielago/react`.

## SSR-only trees (host-owned)

Pages and server components are host-owned product trees. They are **not** bound
to the island filesystem/manifest contract. Put them where your host’s page map
and document shell expect; folder conventions beyond that are up to you.

How you deliver non-island CSS (document shell, page-level sheets, etc.) is also
host policy—not an Archipielago authoring requirement.

## Page embed props stay outside UI modules

SSR “page props” are a host→SSR **embed contract**, not React parent props:

- Host builds plain, JSON-serializable data.
- When dual TypeScript ownership applies, the host HTTP/emit graph must not
  import page `.tsx` modules.
- Keep prop types in a host-owned protocol (or similar) folder—not colocated
  under page UI modules. [Learn why](../../adr/0023-web-host-ui-protocol.md).

Island props remain separate (component props + `data-props` marker).

## Next steps

- Still integrating a non-Nest host? [wiring.md](./wiring.md).
- Nest demonstration / recipe: [nestjs.md](./nestjs.md).
- Nest-example / dogfood website UI conventions (including that site’s CSS
  lanes): [how-to-web-ui.md](../../how-to-web-ui.md).
