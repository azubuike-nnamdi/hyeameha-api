# Hyeameha API

Backend service for **Hyeameha**: a NestJS REST API with PostgreSQL, TypeORM, JWT authentication, and Swagger documentation. The codebase is intentionally **CRUD-focused** (users, auth, health)—no crawling or LLM ingestion pipeline.

## Documentation

| Doc | Contents |
|-----|----------|
| **[docs/README.md](docs/README.md)** | Architecture, env vars, Docker, migrations, API surface, testing |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute, local setup, PR checklist |

## Requirements

- **Node.js** 22+
- **pnpm** (enable via `corepack enable`)
- **PostgreSQL** for development and e2e tests (or use Docker)

## Quick start

```bash
cp .env.example .env
# Edit .env: set DATABASE_*, JWT_*, and other required secrets

pnpm install
pnpm run docker:up          # PostgreSQL + Redis (Compose)
pnpm run start:dev          # API in watch mode (uses Compose services above)
```

- **Swagger:** [http://localhost:3000/docs](http://localhost:3000/docs) (adjust host/port if you changed `PORT` or Compose mapping).
- **Health:** `GET /health` (no auth).

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run start` | Start Nest once |
| `pnpm run start:dev` | Docker Compose (DB + Redis) + Nest watch |
| `pnpm run start:prod` | Run compiled output (`node dist/main`) |
| `pnpm run build` | Compile TypeScript |
| `pnpm run lint` | ESLint (+ Prettier integration) |
| `pnpm test` | Unit tests |
| `pnpm run test:e2e` | E2E tests (needs PostgreSQL) |
| `pnpm run docker:up` | Start `hyeameha-db` and `hyeameha-redis` |
| `pnpm run docker:up:all` | Start full Compose stack (API + DB + Redis) |
| `pnpm run migration:run` | Apply TypeORM migrations (see `docs/README.md`) |

## Docker

- **Image:** `Dockerfile` — Node 22 Alpine, pnpm install, `pnpm build`, `pnpm start:prod`.
- **Compose:** Services `hyeameha-backend`, `hyeameha-db`, `hyeameha-redis`. Published host ports default to **56433** (Postgres) and **56480** (Redis); override with `HYEAMEHA_BACKEND_PORT`, `HYEAMEHA_DB_PORT`, and `HYEAMEHA_REDIS_PORT` if they still clash locally.

Configuration and secrets are **never** baked into the image; pass them via `.env` / orchestrator env (see `.env.example`).

## Configuration

Environment variables are validated at startup with **Joi** (`src/config/env.validation.ts`). Database connection uses **discrete** `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, and `DATABASE_NAME` (no `DATABASE_URL` in app code).

## License

[MIT](LICENSE)
