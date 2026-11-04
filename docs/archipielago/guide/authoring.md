# Authoring

Host-agnostic rules for **product UI** in a host that embeds Archipielago: how to know when something should be built with an island vs when to use an SSR-only component, how islands are shaped, where page props live, and how CSS lanes split.

Use this document to understand how to implement Archipielago in your own host. If you're using NestJS, you can also peek at our example project on the examples/nestjs folder. Since that example host is also the current host of the Archipielago website, you can also pay us a visit there to see the components in action.

## Interactivity boundary

| Need                                                                 | Prefer                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Static / SSR-only markup (no client state, no hydrate-worthy events) | Page or server-rendered child in the host product UI tree              |
| Client interactivity (`useState`, clicks, browser APIs)              | An **island** registered with Archipielago and rendered via `<Island>` |

Using an Archipielago Island for CSS-only optimization meant for an islands architecture is an anti-pattern: a non interactive component doesn't need a CSS style imported through an Island and then injected as a sibling style tag through the framework's runtime. Style tags or linked stylesheets can be loaded from the SSR side already.

## Islands are conventional; SSR trees are freer

**Islands** need a predictable shape so registration, hydrate loaders, and optional CSS sibling tags work:

- Conventional folder such as `ui/islands/<name>/` with a default-export implementation (and optional colocated `*.module.scss`).
- Registration via the host’s island manifest / `registerIslands` (auto sync or manual ownership—[ADR-0028](../../adr/0028-island-filesystem-manifest.md), [ADR-0030](../../adr/0030-archipielago-host-config.md)).
- JSON-serializable island props on the marker; hydrate loads JS for named islands only.

**Pages and server components** are host-owned product trees. They may follow one-folder-per-component conventions in a given host ([ADR-0025](../../adr/0025-per-component-folders.md) in this monorepo’s Nest example), but they are not bound to the island filesystem/manifest contract the same way.

## Page embed props stay outside UI modules

SSR “page props” are a host→SSR **embed contract**, not React parent props:

- Host builds plain, JSON-serializable data.
- The host must not import page `.tsx` into Nest (or equivalent) emit graphs when dual TS ownership applies.
- Keep prop types in a host-owned protocol (or similar) folder—not colocated under page UI modules ([ADR-0023](../../adr/0023-web-host-ui-protocol.md) quirk, restated for engines in later ADRs).

Island props remain separate (component props + `data-props` marker).

## CSS lanes (product policy)

Typical three-lane split ([ADR-0013](../../adr/0013-css-three-lanes.md), [ADR-0015](../../adr/0015-island-css-sibling-style.md)):

| Lane                           | Role                                                                        |
| ------------------------------ | --------------------------------------------------------------------------- |
| Shell / always-on document CSS | First-paint chrome shared across pages                                      |
| Opt-in page sibling sheets     | Shared component CSS (e.g. forms) for pages that declare them               |
| Island `*.module.scss`         | Interaction-specific styles; often inlined as sibling `<style>` tags at SSR |

Hosts own which sheets exist and which pages opt in; Archipielago ships the emit/mount helpers.

## Next steps

1. Wire the host: [wiring.md](./wiring.md).
2. See Nest as one worked mapping: [nestjs.md](./nestjs.md).
3. For this repo’s Nest example / dogfood UI day-to-day: [how-to-web-ui.md](../../how-to-web-ui.md).
