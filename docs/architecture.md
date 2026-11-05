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

## Agent plans

One workspace file, `.cursor/plans/YYYY-MM-DD-kebab-slug.md`, is the plan for
an effort ([ADR-0031](./adr/0031-project-plan-files.md)). Edit that file. Do
not create a second copy to resume across devices or between the IDE and the
web. Commit plan updates on the pull request while the file exists, including
a trailing `## Todos` checklist that mirrors the YAML `todos`. Delete the
file in a later commit before merge. Day-to-day rules:
[AGENTS.md](../AGENTS.md) and
[workflow.md](./archipielago/workflow.md#agent-plans).
