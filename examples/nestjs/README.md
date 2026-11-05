# NestJS host example

First runnable NestJS **host example** for Archipielago. It consumes `@archipielago/{core,react,vite,nestjs}`, serves a JSON API under `/api`, and React SSR + islands at the root.

Shared workspace prereqs, `pnpm install`, and contributor checks: [root README](../../README.md). Product guide: [docs/archipielago/guide/](../../docs/archipielago/guide/README.md). Nest demonstration / recipe: [guide/nestjs.md](../../docs/archipielago/guide/nestjs.md). Example current-state: [docs/architecture.md](./docs/architecture.md). Dogfood website UI cookbook (maintainer workflow; optional if you copy this style): [how-to-web-ui.md](../../docs/how-to-web-ui.md).

Root `pnpm start`, `test`, `storybook`, and similar scripts currently filter into this package ([TD-034](../../docs/known-tech-debt.md)).

## Database

PostgreSQL via Prisma. Copy the env file and keep `DATABASE_URL` pointed at local Compose (defaults match the Makefile):

```bash
cp .env.example .env
```

From the **repo root**:

```bash
# start Postgres (Docker Compose)
make -C examples/nestjs db-up

# apply migrations
make -C examples/nestjs db-migrate-deploy

# optional demo row
make -C examples/nestjs db-seed
```

Other Make targets: `db-down`, `db-logs`, `db-migrate` (dev), `db-reset`, `db-studio`. Persistence: [architecture.md § Persistence](./docs/architecture.md#persistence), [ADR-0005](../../docs/adr/0005-persistence-postgres-prisma.md).

E2E does **not** use Compose. `pnpm test:e2e` (from the repo root) starts Postgres with Testcontainers (Docker required).

## Run

From the **repo root** (DB should be up for a full app):

```bash
# development, with reload
pnpm start:dev

# development, one shot
pnpm start

# production (build first)
pnpm build
pnpm start:prod
```

The example listens on port 3000 unless `PORT` is set.

- Home page: [http://localhost:3000/](http://localhost:3000/)
- Greeting: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- OpenAPI document: [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)

## Observability

The example is instrumented with [NestJS Observe](https://observe.nestjs.com). To exercise that integration on your machine, request keys and put them in `.env`. Skip this section otherwise.

Request keys with:

```bash
npx @nestjs/observe link
```

Approve the printed code at [observe.nestjs.com/link](https://observe.nestjs.com/link). Then copy `.env.example` (if you have not already) and fill in the two values:

```bash
cp .env.example .env
```

`.env` is gitignored. `start`, `start:dev`, and `start:debug` load it. In production, set `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in the environment instead of using that file.

## Authoring UI in this example

Host-agnostic cheat sheet: [guide/authoring.md](../../docs/archipielago/guide/authoring.md).
For this example’s / dogfood website UI folders and scaffold, prefer
`pnpm scaffold:web-ui` (from the repo root) or the `create-web-ui` agent skill
and follow [how-to-web-ui.md](../../docs/how-to-web-ui.md). The scaffolder remains
example-local for now ([TD-035](../../docs/known-tech-debt.md)).
