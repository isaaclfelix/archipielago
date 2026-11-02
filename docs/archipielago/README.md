# Archipielago

**Archipielago** is an embeddable islands rendering layer for backend apps that already own routing, auth, and data. It server-renders React pages, hydrates only interactive islands, and plugs into the host through thin adapters.

The product name honors Spanish (_archipiélago_) but **drops the accent**—Archipielago, not Archipiélago—so it reads as an international product name rather than a literal dictionary word. Do not introduce other Spanish brand words; kinship labels in the vision (mother, father, Godfather) stay English.

This repository is the **Archipielago monorepo**: framework packages under `packages/*`, runnable host examples (NestJS under `examples/nestjs`), shared tooling, and eventually the public site—which dogfoods Archipielago itself. **Documentation’s home and source of truth remain in this repo** (see [mission.md](./mission.md)).

| Doc                          | Purpose                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| [mission.md](./mission.md)   | Human-first AI assist, developer-first OSS, community standards    |
| [workflow.md](./workflow.md) | Recommended AI-assisted flow; mandatory ADR / tech-debt guidelines |
| [vision.md](./vision.md)     | Philosophy, market position, ownership split, monorepo, non-goals  |
| [roadmap.md](./roadmap.md)   | Long-term phases from isolation through parity and differentiation |

### Guide (start here for host integration)

Read the guide in order—**concepts → install → wiring → authoring → nestjs**. Nest is a **worked mapping** of the host-agnostic steps so you can wire other hosts even without more `examples/*`. Landing page: [guide/README.md](./guide/README.md).

| Doc                                        | Purpose                                                      |
| ------------------------------------------ | ------------------------------------------------------------ |
| [guide/concepts.md](./guide/concepts.md)   | Host-agnostic primitives and ownership split                 |
| [guide/install.md](./guide/install.md)     | Workspace install today; future `0.0.1` publish              |
| [guide/wiring.md](./guide/wiring.md)       | Ordered host-agnostic integration steps                      |
| [guide/authoring.md](./guide/authoring.md) | Portable product UI rules (islands vs SSR trees, props, CSS) |
| [guide/nestjs.md](./guide/nestjs.md)       | Nest example mapped onto those steps                         |

Nest-example / dogfood **website** UI cookbook (in-repo implementers and anyone copying this style—not primary package-consumer docs): [how-to-web-ui.md](../how-to-web-ui.md).

Layout: `@archipielago/{core,react,vite,nestjs}` in `packages/*`; Nest host in `examples/nestjs` ([ADR-0032](../adr/0032-archipielago-pnpm-monorepo.md)). Current-state map: [architecture.md](../architecture.md). Durable decisions: [docs/adr/](../adr/README.md).
