# Architecture

Monorepo orientation for Archipielago. This page is **not** the Nest example’s
current-state map.

| Doc                                                                             | Purpose                                                                    |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [docs/archipielago/guide/](./archipielago/guide/README.md)                      | Host-agnostic product guide (concepts → install → Nest or DIY → authoring) |
| [examples/nestjs/docs/architecture.md](../examples/nestjs/docs/architecture.md) | Nest example / dogfood website current-state (API, SSR, styles, build)     |
| [docs/adr/](./adr/README.md)                                                    | Durable Architecture Decision Records                                      |
| [docs/archipielago/workflow.md](./archipielago/workflow.md#agent-plans)         | Recommended AI-assisted flow, including **agent plans** (repo-wide)        |

When an ADR changes how the Nest example works today, update
[examples/nestjs/docs/architecture.md](../examples/nestjs/docs/architecture.md)
(and how-to / AGENTS paths when they drift).
