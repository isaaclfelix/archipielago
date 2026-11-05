# Archipielago

**Archipielago** is an embeddable islands rendering layer for backend apps that already own routing, auth, and data. It server-renders React pages, hydrates only interactive islands, and plugs into the host through thin adapters.

This repository is the **Archipielago monorepo**: framework packages under `packages/*`, runnable host examples (NestJS under `examples/nestjs`), shared tooling, and eventually the public site—which dogfoods Archipielago itself. **Documentation’s home and source of truth remain in this repo** (see [mission.md](./mission.md)).

| Doc                          | Purpose                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| [mission.md](./mission.md)   | Human-first AI assist, developer-first OSS, community standards    |
| [workflow.md](./workflow.md) | Recommended AI-assisted flow; mandatory ADR / tech-debt guidelines |
| [vision.md](./vision.md)     | Philosophy, market position, ownership split, monorepo, non-goals  |
| [roadmap.md](./roadmap.md)   | Long-term phases from isolation through parity and differentiation |

### Guide (start here for host integration)

Read **concepts → install → nestjs** (see Nest working), then either stay on Nest or DIY with **wiring**, then keep **authoring** as the post-connect cheat sheet. Landing page: [guide/README.md](./guide/README.md).

| Doc                                        | Purpose                                                               |
| ------------------------------------------ | --------------------------------------------------------------------- |
| [guide/concepts.md](./guide/concepts.md)   | Host-agnostic primitives and ownership split                          |
| [guide/install.md](./guide/install.md)     | Workspace install today; future `0.0.1` publish                       |
| [guide/nestjs.md](./guide/nestjs.md)       | Demonstration + Nest host recipe in this repo                         |
| [guide/wiring.md](./guide/wiring.md)       | DIY host-agnostic integration (when your host is not the Nest recipe) |
| [guide/authoring.md](./guide/authoring.md) | Post-connect quick reference (islands vs SSR, props)                  |

`examples/nestjs` is both the documented Nest recipe and the future dogfood website host.

Dogfood / Nest-example **website** UI cookbook (maintainer workflow; optional if you copy this example’s UI style—not required on the consumer spine): [how-to-web-ui.md](../how-to-web-ui.md).

Layout: `@archipielago/{core,react,vite,nestjs}` in `packages/*`; Nest host in `examples/nestjs` ([ADR-0032](../adr/0032-archipielago-pnpm-monorepo.md)). Current-state map: [architecture.md](../architecture.md). Durable decisions: [docs/adr/](../adr/README.md).
