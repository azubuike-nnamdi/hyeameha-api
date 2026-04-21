# Hyeameha API — technical documentation

This document describes architecture, configuration, and operations for the **Hyeameha** backend. For onboarding and scripts, see the [root README](../README.md). For how to contribute, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## What this service is

A **CRUD-oriented** NestJS API: users, JWT auth, health checks, and Swagger at `/docs`. There is **no** LLM, crawling, or ingestion stack—configuration and dependencies reflect that.

## Stack

| Layer | Choice |
|--------|--------|
| Runtime | Node.js 22 (see `Dockerfile`), NestJS 11 |
| Database | PostgreSQL (image `postgres:15.17-trixie` in Docker Compose) |
| ORM | TypeORM — `User` in `src/users/entities/user.entity.ts`, `DatabaseModule` in `src/database/` |
| Cache / jobs | Redis container in Compose; env vars validated for future use |
| Auth | JWT access tokens, bcrypt password hashes |
| Config | `AppConfigModule` (`src/config/config.module.ts`) with **Joi** (`src/config/env.validation.ts`). **No** `configuration.ts` — all secrets and DB settings come from **environment variables** (see `.env.example`). |
| Tooling | pnpm, ESLint (type-aware) + Prettier |

## Configuration

- **Bootstrap:** `ConfigModule.forRoot` loads `.env` (and process env). Validation runs at startup; missing required keys fail fast.
- **Database:** `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` — **not** a single `DATABASE_URL` in application code.
- **JWT:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` (secrets must meet Joi rules, e.g. minimum length).
- **CORS:** `CORS_ORIGIN` (comma-separated origins allowed).
- **Throttling:** `THROTTLE_*` env vars (see `.env.example`).

Copy `.env.example` to `.env` and set real values before running locally or in Docker.

## Data layer

- **Connection:** `TypeOrmModule.forRootAsync` reads discrete Postgres fields from `ConfigService` (`src/database/database.module.ts`).
- **Schema sync:** `synchronize` is **on** when `NODE_ENV !== 'production'`. In production, set `NODE_ENV=production` and apply **migrations** (or provision tables separately).
- **Users:** `UsersService` uses `@InjectRepository(User)`; unique email violations (PostgreSQL `23505`) map to HTTP **409**.
- **Health:** `GET /health` checks DB via TypeORM `DataSource` (`SELECT 1`).

## Docker

Compose services (see `docker-compose.yml`):

| Service | Role |
|---------|------|
| `hyeameha-backend` | API image built from `Dockerfile` (pnpm build + `start:prod`) |
| `hyeameha-db` | PostgreSQL |
| `hyeameha-redis` | Redis |

Host port overrides: `HYEAMEHA_BACKEND_PORT`, `HYEAMEHA_DB_PORT`, `HYEAMEHA_REDIS_PORT`. Defaults map **56433→5432** (Postgres) and **56480→6379** (Redis) on the host unless you set those env vars. The API container expects `.env` via `env_file` and talks to DB/Redis by **service names** (`hyeameha-db`, `hyeameha-redis`).

Convenience scripts: `pnpm run docker:up` (DB + Redis), `pnpm run docker:up:all` (full stack), `pnpm run start:dev` (Compose DB + Redis, then Nest in watch mode).

## Migrations (TypeORM CLI)

CLI entry: `src/database/data-source.ts` (uses `dotenv` for local runs).

| Command | Purpose |
|---------|---------|
| `pnpm run migration:generate` | Generate a migration from entity changes |
| `pnpm run migration:run` | Apply pending migrations |
| `pnpm run migration:revert` | Revert the last migration |

## Testing

- **Unit:** `pnpm test` — Jest, `src/**/*.spec.ts`.
- **E2E:** `pnpm run test:e2e` — loads `test/setup-e2e-env.ts` so env validation passes; expects PostgreSQL reachable with the same discrete `DATABASE_*` variables (default DB name `hyeameha` in examples). The suite may reset the `users` table before boot; align credentials with your local DB.

## API surface

| Area | Notes |
|------|--------|
| Health | `GET /health` — public |
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` — JSON includes `accessToken`, `refreshToken` (hashed in DB), and `user` |
| Users | `GET /api/v1/users/me`, `PATCH /api/v1/users/me` (Bearer JWT) |
| Docs | Swagger UI at `/docs`, OpenAPI JSON at `/docs-json` |

Global prefix: `api/v1` (health and docs excluded). Clients send `Authorization: Bearer <accessToken>` on protected routes.

## Linting and TypeScript

ESLint uses **type-aware** rules with `parserOptions.project` pointing at `tsconfig.json`. The repo sets `lib` / `include` explicitly so TypeORM and test helpers resolve cleanly; keep `test/` typings (e.g. `@types/superagent` for e2e helpers) in sync when adding imports.
