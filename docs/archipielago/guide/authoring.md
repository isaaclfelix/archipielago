# Authoring

Post-connect **quick reference** for product UI once Archipielago is wired
(Nest recipe or DIY). Use it to remember SSR-only vs islands, which shapes are
canonical, where page props live, and how CSS lanes split.

Prereq: [nestjs.md](./nestjs.md) or [wiring.md](./wiring.md) done so pages
render through the host.

## Interactivity boundary

| Need                                                                 | Prefer                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Static / SSR-only markup (no client state, no hydrate-worthy events) | Page or server-rendered child in the host product UI tree              |
| Client interactivity (`useState`, clicks, browser APIs)              | An **island** registered with Archipielago and rendered via `<Island>` |

Do not create an island only to attach CSS. Non-interactive markup should use
shell or opt-in page stylesheets from the SSR side; island CSS modules exist for
interaction-owned rules the runtime can emit as sibling `<style>` tags.

## Island shape vs SSR trees

**Islands** need a predictable shape so registration, hydrate loaders, and
optional CSS sibling tags work:

- Conventional folder such as `ui/islands/<name>/` with a default-export
  implementation (and optional colocated `*.module.scss`).
- Registration via the host’s island manifest / `registerIslands` (auto sync or
  manual ownership). [Learn why](../../adr/0028-island-filesystem-manifest.md)
  · [See more](../../adr/0030-archipielago-host-config.md).
- JSON-serializable island props on the marker; hydrate loads JS for named
  islands only.

**Pages and server components** are host-owned product trees. They are not bound
to the island filesystem/manifest contract the same way.

## Page embed props stay outside UI modules

SSR “page props” are a host→SSR **embed contract**, not React parent props:

- Host builds plain, JSON-serializable data.
- When dual TypeScript ownership applies, the host HTTP/emit graph must not
  import page `.tsx` modules.
- Keep prop types in a host-owned protocol (or similar) folder—not colocated
  under page UI modules. [Learn why](../../adr/0023-web-host-ui-protocol.md).

Island props remain separate (component props + `data-props` marker).

## CSS lanes (product policy)

Typical three-lane split:

| Lane                           | Role                                                                        |
| ------------------------------ | --------------------------------------------------------------------------- |
| Shell / always-on document CSS | First-paint chrome shared across pages                                      |
| Opt-in page sibling sheets     | Shared component CSS (e.g. forms) for pages that declare them               |
| Island `*.module.scss`         | Interaction-specific styles; often inlined as sibling `<style>` tags at SSR |

Hosts own which sheets exist and which pages opt in; Archipielago ships the
emit/mount helpers. [Learn why](../../adr/0013-css-three-lanes.md).

## Next steps

- Still integrating a non-Nest host? [wiring.md](./wiring.md).
- Nest demonstration / recipe: [nestjs.md](./nestjs.md).
- Building or copying this repo’s Nest-example / dogfood website UI style:
  [how-to-web-ui.md](../../how-to-web-ui.md).
