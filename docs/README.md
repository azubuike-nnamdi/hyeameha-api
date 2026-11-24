# Hyeameha API — technical documentation

This document describes architecture, configuration, and operations for the **Hyeameha** backend. For onboarding and scripts, see the [root README](../README.md). For how to contribute, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## What this service is

A **CRUD-oriented** NestJS API: users, JWT auth, events (local + eGotickets partner), health checks, and Swagger at `/docs`. There is **no** LLM, crawling, or ingestion stack—configuration and dependencies reflect that.

## Stack

| Layer        | Choice                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime      | Node.js 22 (see `Dockerfile`), NestJS 11                                                                                                                                                                           |
| Database     | PostgreSQL (image `postgres:15.17-trixie` in Docker Compose)                                                                                                                                                       |
| ORM          | TypeORM — `User`, `Event` in `src/users/` and `src/events/`; `DatabaseModule` in `src/database/`                                                                                                                   |
| Events       | Local catalog in PostgreSQL; bookable partner events via eGotickets HTTP API (`PartnerEventsClient`)                                                                                                               |
| Cache / jobs | Redis container in Compose; env vars validated for future use                                                                                                                                                      |
| Auth         | JWT access tokens, bcrypt password hashes                                                                                                                                                                          |
| Config       | `AppConfigModule` (`src/config/config.module.ts`) with **Joi** (`src/config/env.validation.ts`). **No** `configuration.ts` — all secrets and DB settings come from **environment variables** (see `.env.example`). |
| Tooling      | pnpm, ESLint (type-aware) + Prettier                                                                                                                                                                               |

## Configuration

- **Bootstrap:** `ConfigModule.forRoot` loads `.env` (and process env). Validation runs at startup; missing required keys fail fast.
- **Database:** `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` — **not** a single `DATABASE_URL` in application code.
- **JWT:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES` (default `15m`), `JWT_REFRESH_EXPIRES` (secrets must meet Joi rules, e.g. minimum length). Tokens carry the user's `token_version`; changing or resetting the password, or deleting the account, bumps it and revokes every outstanding access and refresh token.
- **CORS:** `CORS_ORIGIN` (comma-separated origins allowed).
- **Throttling:** `@nestjs/throttler` runs before auth on every route: `THROTTLE_DEFAULT_*` per client IP, plus the stricter `THROTTLE_AUTH_*` on `/auth/*` and `POST /users/me/password`. Counters live in Redis (`THROTTLE_STORAGE=redis`, `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`) so limits hold across instances; `THROTTLE_STORAGE=memory` for a single process or tests. If Redis is unreachable the limiter fails open and logs an error.
- **Client IP:** `TRUST_PROXY_HOPS` (default `1`) is how many reverse proxies sit in front of the API. Set `0` when clients connect directly; set it to the real hop count behind a load balancer, otherwise clients can spoof their IP via `X-Forwarded-For`.
- **Swagger:** `SWAGGER_ENABLED` (default `true` in development, `false` in production).
- **Password reset:** `PASSWORD_RESET_OTP_MAX_ATTEMPTS` (default 5) wrong codes before the OTP is discarded.
- **eGotickets (partner events):** `EVENT_BASE_URL` (e.g. `https://egotickets.com`), `EVENT_API_KEY` (partner API key; sent as `Authorization: <key>` to the partner API).
- **Email (Altermail):** `MAIL_ENABLED`, `ALTER_MAIL_KEY`, `ALTERMAIL_API_URL` (optional), `MAIL_FROM` (must be a **verified** sender domain in the Altermail console — unverified `fromEmail` returns HTTP 403 and no email is sent), `PASSWORD_RESET_OTP_EXPIRES_MINUTES`, `PASSWORD_RESET_OTP_LENGTH`.

Copy `.env.example` to `.env` and set real values before running locally or in Docker.

## Data layer

- **Connection:** `TypeOrmModule.forRootAsync` reads discrete Postgres fields from `ConfigService` (`src/database/database.module.ts`).
- **Schema changes:** `synchronize` is **off** everywhere; the schema comes only from migrations. In development and test, pending migrations run automatically when the app starts. In production (`NODE_ENV=production`) run `pnpm run migration:run` (or `migration:run:prod` from `dist/`) before deploying. After changing an entity, create a migration with `pnpm run migration:generate`.
- **Users:** `UsersService` uses `@InjectRepository(User)`; duplicate emails map to HTTP **409**. Emails are stored lower-cased and looked up case-insensitively. Each user has a `role`: `user` (default), `editor`, `admin`, or `super_admin`.
- **Events:** Local rows in `events`; partner events are fetched live from eGotickets and merged in list/detail responses (`source`: `local` | `partner`).
- **API failure logs:** Failed inbound API responses (HTTP ≥ 400) are stored in `api_failure_logs` with a searchable `tag` (`login`, `register`, `events`, `users`, etc.). Outbound **Altermail** errors use tags `mail-register`, `mail-login`, `mail-forgot-password` and store the provider JSON in `response_body` even when the route still returns 201 (e.g. register). Credentials, tokens, OTPs, payment fields and phone numbers / guest emails are redacted at any depth; long strings are truncated. Rate-limited (429) responses are not logged. Rows older than `API_FAILURE_LOG_RETENTION_DAYS` (default 30) are deleted nightly.
- **Health:** `GET /health` checks DB via TypeORM `DataSource` (`SELECT 1`).

## Docker

Compose services (see `docker-compose.yml`):

| Service            | Role                                                          |
| ------------------ | ------------------------------------------------------------- |
| `hyeameha-backend` | API image built from `Dockerfile` (multi-stage; runs `node dist/main` as the non-root `node` user with production dependencies only) |
| `hyeameha-db`      | PostgreSQL                                                    |
| `hyeameha-redis`   | Redis                                                         |

Host port overrides: `HYEAMEHA_BACKEND_PORT`, `HYEAMEHA_DB_PORT`, `HYEAMEHA_REDIS_PORT`. Defaults map **56433→5432** (Postgres) and **56480→6379** (Redis). All ports are published on **127.0.0.1 only**; set `HYEAMEHA_BACKEND_BIND=0.0.0.0` if the API itself must be reachable from other hosts. The backend defaults to `NODE_ENV=production` (no schema sync, Swagger off). Redis requires `REDIS_PASSWORD` whenever it is set — always set it outside local dev. The API container expects `.env` via `env_file` and talks to DB/Redis by **service names** (`hyeameha-db`, `hyeameha-redis`).

Convenience scripts: `pnpm run docker:up` (DB + Redis), `pnpm run docker:up:all` (full stack), `pnpm run start:dev` (Compose DB + Redis, then Nest in watch mode).

## Migrations (TypeORM CLI)

CLI entry: `src/database/data-source.ts` (uses `dotenv` for local runs).

| Command                       | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| `pnpm run migration:generate` | Generate a migration from entity changes |
| `pnpm run migration:run`      | Apply pending migrations                 |
| `pnpm run migration:revert`   | Revert the last migration                |
| `pnpm run migration:run:prod` | Apply migrations from compiled `dist/` (no ts-node; works inside the production image) |

When PostgreSQL runs via Docker Compose, set `DATABASE_PORT=56433` in `.env` (or your `HYEAMEHA_DB_PORT`) before running migrations from the host. Ensure the DB is up: `pnpm run docker:up`.

## Testing

- **Unit:** `pnpm test` — Jest, `src/**/*.spec.ts`.
- **E2E:** `pnpm run test:e2e` — loads `test/setup-e2e-env.ts` so env validation passes; expects PostgreSQL reachable with the same discrete `DATABASE_*` variables (default DB name `hyeameha` in examples). The suite may reset the `users` table before boot; align credentials with your local DB.

## API surface

Global prefix: `api/v1` (health and docs excluded). Protected routes require `Authorization: Bearer <accessToken>`. Interactive reference: Swagger UI at `/docs`, OpenAPI JSON at `/docs-json`.

### Health

| Method | Path      | Auth |
| ------ | --------- | ---- |
| GET    | `/health` | None |

### Auth

| Method | Path                           | Auth | Notes                                                                                                                 |
| ------ | ------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/auth/register`        | None | Returns `message`, `accessToken`, `refreshToken`, `user` (`user.role` is `user`)                                      |
| POST   | `/api/v1/auth/login`           | None | Returns `message`, `accessToken`, `refreshToken`, and `user`                                                          |
| POST   | `/api/v1/auth/refresh`         | None | Body: `{ "refreshToken": "..." }`. Returns new `accessToken` and rotated `refreshToken` when the refresh JWT is valid |
| POST   | `/api/v1/auth/forgot-password` | None | Body: `{ "email" }`. Sends OTP email if account exists (same response either way)                                     |
| POST   | `/api/v1/auth/reset-password`  | None | Body: `{ "email", "otp", "newPassword" }`. Verifies OTP, updates password, deletes OTP                                |

`user` in auth responses includes `role` (`user` | `admin`). Registration always creates `user` role.

**Email notifications (Altermail API):** welcome email on register; login alert with IP / user-agent on login; OTP email on forgot-password. Set `ALTER_MAIL_KEY` and `MAIL_FROM` in `.env` (set `MAIL_ENABLED=false` to disable sending).

**Password reset:** OTP is stored hashed in `password_reset_otps` and removed after successful reset. Previous refresh tokens are invalidated on reset.

Use **refresh** when the access token expires: send the stored refresh token to obtain a new access token (and a new refresh token; the old refresh token is invalidated).

### Users

| Method | Path                        | Auth   | Notes                             |
| ------ | --------------------------- | ------ | --------------------------------- |
| GET    | `/api/v1/users/me`          | Bearer | Current profile (`role` included) |
| PATCH  | `/api/v1/users/me`          | Bearer | Update name / phone               |
| POST   | `/api/v1/users/me/password` | Bearer | Change password (200); signs out all sessions |
| DELETE | `/api/v1/users/me`          | Bearer | Soft-delete account               |
| GET    | `/api/v1/users`             | Bearer | List users (sanitized); **admin or super_admin only**; `?page=&limit=` (default 50, max 100) |

### Events

All event routes require Bearer auth unless noted. Manage routes return **403** unless `user.role` is `admin` or `super_admin`.

| Method | Path                                   | Who                    | Description                                                                                 |
| ------ | -------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| GET    | `/api/v1/events`                       | Any authenticated user | Local events (`source: local`) plus eGotickets partner events (`source: partner`)           |
| GET    | `/api/v1/events/:id`                   | Any authenticated user | Local event by UUID, or partner event by numeric id (includes `tickets` for partner events) |
| POST   | `/api/v1/events`                       | **Admin / super_admin** | Create a local event                                                                        |
| PATCH  | `/api/v1/events/:id`                   | **Admin / super_admin** | Update a local event (UUID only)                                                            |
| DELETE | `/api/v1/events/:id`                   | **Admin / super_admin** | Delete a local event (UUID only)                                                            |
| POST   | `/api/v1/events/:id/calculate_charges` | Any authenticated user | Proxy to eGotickets; **numeric partner id only**; JSON object body (≤16 KB, depth ≤5) forwarded unchanged |
| POST   | `/api/v1/events/:id/buy_ticket`        | Any authenticated user | Same as above; each purchase is logged with the buyer's user id |

**Local event body** (`POST` / `PATCH`): `title`, `location`, `image`, `eventDate` (`YYYY-MM-DD`), `status` (`popular` | `ongoing` | `new`), `type`, `price`.

**Event list/detail fields:** common shape in `EventResponseDto`; partner events map eGotickets fields (e.g. `name` → `title`). `source` distinguishes origin.

**Partner API (upstream, used by this service):**

| Purpose                  | Method | URL                                                                    |
| ------------------------ | ------ | ---------------------------------------------------------------------- |
| List partner events      | GET    | `{EVENT_BASE_URL}/apis/partner-api/events`                             |
| Get one partner event    | GET    | `{EVENT_BASE_URL}/apis/partner-api/events/{eventId}`                   |
| Calculate ticket charges | POST   | `{EVENT_BASE_URL}/apis/partner-api/events/{eventId}/calculate_charges` |
| Buy ticket               | POST   | `{EVENT_BASE_URL}/apis/partner-api/events/{eventId}/buy_ticket`        |

Booking request/response bodies match the eGotickets partner contract; this API does not reshape them. Partner errors are mapped to our own codes: partner 404 → 404, other partner 4xx → 400 (message only), partner 401/403/5xx or network failure → 502. The partner's raw error body is never returned. If the partner is down, `GET /events` returns local events only.

### Promoting an admin

After applying migrations (`pnpm run migration:run`), set role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

The user must log in again (or use a new token) so the JWT includes `role: admin`.

### Querying API failure logs

```sql
SELECT tag, status_code, message, path, created_at
FROM api_failure_logs
WHERE tag = 'login'
ORDER BY created_at DESC
LIMIT 50;
```

Tags are set via `@ApiFailureTag()` on controllers/handlers, or inferred from the URL (e.g. `/api/v1/auth/login` → `login`).

## Linting and TypeScript

ESLint uses **type-aware** rules with `parserOptions.project` pointing at `tsconfig.json`. The repo sets `lib` / `include` explicitly so TypeORM and test helpers resolve cleanly; keep `test/` typings (e.g. `@types/supertest` for e2e) in sync when adding imports.
