# Archipielago

**Archipielago** is an embeddable islands rendering layer for backend apps that already own routing, auth, and data. It server-renders React pages, hydrates only interactive islands, and plugs into the host through thin adapters.

This repository is the **Archipielago monorepo**: framework packages under `packages/*`, a NestJS host example under `examples/nestjs`, shared tooling, and in-repo docs as the source of truth ([ADR-0032](./docs/adr/0032-archipielago-pnpm-monorepo.md)). Root `pnpm` scripts filter into the Nest example today ([TD-034](./docs/known-tech-debt.md)).

Product home: [docs/archipielago/README.md](./docs/archipielago/README.md).

## Examples

To run something locally, use the NestJS host example:

- [examples/nestjs/README.md](./examples/nestjs/README.md) — database, run, observability, and Nest-example URLs

## Prerequisites

- A **Unix** environment. Local development is tested on **Ubuntu 26.04 LTS under WSL2**. macOS and native Windows (outside WSL) are not verified yet ([ADR-0022](./docs/adr/0022-unix-wsl-playwright-browser-cache.md), **TD-027** in [docs/known-tech-debt.md](./docs/known-tech-debt.md)).
- [pnpm](https://pnpm.io/installation) 12. This repo uses pnpm, not npm or Yarn.
- Node.js 24.22.0. That version is pinned in [`.node-version`](./.node-version). `package.json` requires Node `>=24.7.0`.
- [Docker](https://docs.docker.com/get-docker/) for e2e (Testcontainers) and for the optional local database in the Nest example.
- [GNU Make](https://www.gnu.org/software/make/) for Nest example database helpers ([`examples/nestjs/Makefile`](./examples/nestjs/Makefile)). Not required for `pnpm test` / CI unit jobs.

Install pnpm first, then install Node with pnpm's runtime manager and put `node` on your PATH:

```bash
pnpm runtime set node 24.22.0 -g
```

`-g` installs Node 24.22.0 globally. Without it, the same command also writes a `devEngines` entry into this project.

Confirm both tools before installing dependencies:

```bash
pnpm --version
node --version
```

`node --version` should print `v24.22.0`.

## Setup

```bash
pnpm install
```

`pnpm install` installs Git hooks, builds `@archipielago/{core,vite,nestjs}`, and runs the Nest example `postinstall` (`prisma generate` + islands sync). Commit, branch, and lint rules are in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Checks

Run these locally before opening a pull request. [CI](./.github/workflows/ci.yml) runs the same five commands, each in its own job, after `pnpm install --frozen-lockfile`. Warnings fail lint. Coverage fails under the thresholds in [docs/testing-and-coverage.md](./docs/testing-and-coverage.md).

| CI job     | Local command   | What it does                                                                |
| ---------- | --------------- | --------------------------------------------------------------------------- |
| `lint`     | `pnpm lint`     | Oxlint, type-aware, on `packages/` and `examples/`. Warnings fail.          |
| `build`    | `pnpm build`    | Package builds, then Nest compile / Vite client + SSR for the Nest example. |
| `unit`     | `pnpm test`     | Unit tests (`*.spec.ts`) via `@archipielago/example-nestjs`.                |
| `e2e`      | `pnpm test:e2e` | HTTP tests (`*.e2e-spec.ts`) against Nest + Testcontainers Postgres.        |
| `coverage` | `pnpm test:cov` | The unit suite again, with coverage thresholds.                             |

```bash
pnpm lint
pnpm build
pnpm test
pnpm test:e2e
pnpm test:cov
```

Local-only helpers, not separate CI jobs:

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `pnpm format`       | Write Prettier formatting.            |
| `pnpm format:check` | Fail if Prettier would change a file. |
| `pnpm test:watch`   | Re-run unit tests on change.          |
| `pnpm test:debug`   | Unit tests with the Node inspector.   |

## Documentation

### Philosophy and process

- [docs/archipielago/mission.md](./docs/archipielago/mission.md) — human-first AI assist, developer-first OSS, community standards.
- [docs/archipielago/vision.md](./docs/archipielago/vision.md) — product philosophy, market position, ownership split.
- [docs/archipielago/workflow.md](./docs/archipielago/workflow.md) — recommended AI-assisted contribution flow.
- [docs/archipielago/roadmap.md](./docs/archipielago/roadmap.md) — current roadmap status and phases.

### Product and current state

- [docs/archipielago/README.md](./docs/archipielago/README.md) — product home and guide start-here.
- [docs/archipielago/guide/](./docs/archipielago/guide/README.md) — host-agnostic concepts → install → wiring → authoring → Nest mapping.
- [docs/architecture.md](./docs/architecture.md) — current-state map of the Nest host example and packages.
- [docs/adr/](./docs/adr/README.md) — Architecture Decision Records (durable tradeoffs).
- [docs/how-to-web-ui.md](./docs/how-to-web-ui.md) — Nest-example / dogfood website UI cookbook (pages, islands, styles, icons).
- [docs/testing-and-coverage.md](./docs/testing-and-coverage.md) — unit tests, e2e, coverage thresholds, and CI.
- [docs/known-tech-debt.md](./docs/known-tech-debt.md) — deferred work (TD-IDs).
- [CONTRIBUTING.md](./CONTRIBUTING.md) — branch names, commit messages, hooks, formatting, and lint.

## Agents

[AGENTS.md](./AGENTS.md) is the standing instruction file for coding agents in this repo. It requires line comments on non-obvious steps, JSDoc and explicit TypeScript types on every application function, green lint and typecheck after edits, and one commit per logical slice on a multi-step task.

Project skills live in [`.agents/skills`](./.agents/skills):

- [create-commit](./.agents/skills/create-commit/SKILL.md) — stage the current slice and write a Conventional Commit. [AGENTS.md](./AGENTS.md) is the ask for those incremental commits. Do not push unless asked.
- [create-pr](./.agents/skills/create-pr/SKILL.md) — push the branch with `gh` and create or update the pull request from [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md). Use it when asked to open a PR or refresh the description (`/create-pr`).
- [plan-mode-for-cloud](./.agents/skills/plan-mode-for-cloud/SKILL.md) — on a Cloud Agent or cursor.com/agents only, write an implementation plan under `.cursor/plans/` and wait for approval before product edits (`/plan-mode-for-cloud`). The desktop IDE and the CLI keep Plan mode. See [ADR-0031](./docs/adr/0031-project-plan-files.md).

## License

UNLICENSED. This is a private project.
