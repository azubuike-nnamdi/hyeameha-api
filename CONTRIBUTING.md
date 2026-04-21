# Contributing to Hyeameha API

Thanks for helping improve this project. This guide covers setup, quality checks, and how we expect changes to be proposed.

## Prerequisites

- **Node.js** 22+ (matches the `Dockerfile`)
- **pnpm** (Corepack: `corepack enable`)
- **PostgreSQL** for local runs and e2e tests (or use Docker: `pnpm run docker:up`)
- Optional: **Docker** + Docker Compose for the full stack (`docker-compose.yml`)

## Getting started

1. Clone the repository and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment template and fill in secrets:

   ```bash
   cp .env.example .env
   ```

   Never commit real secrets. Required values are validated at startup (see `src/config/env.validation.ts`).

3. Start dependencies and the app:

   ```bash
   pnpm run docker:up    # PostgreSQL + Redis only
   pnpm run start:dev    # Nest in watch mode (uses Compose for DB/Redis)
   ```

   Or run only the API if your database is already running:

   ```bash
   pnpm run start:dev
   ```

## What we expect in a change

- **Scope:** Keep pull requests focused on one concern (feature, fix, or doc update). Avoid unrelated refactors.
- **Config:** Do not hardcode database credentials, JWT secrets, or environment-specific URLs in source code. Use `ConfigService` and `.env` / deployment env vars.
- **Style:** Match existing patterns (Nest modules, DTOs, TypeORM usage). Run the formatter and linter before pushing.
- **Tests:** Add or update tests when behavior changes. Fix regressions you introduce.

## Checks to run before opening a PR

From the repo root:

```bash
pnpm run lint
pnpm run build
pnpm test
pnpm run test:e2e
```

E2E tests need a reachable PostgreSQL instance and valid `DATABASE_*` (and related) variables—see `test/setup-e2e-env.ts` and `docs/README.md`.

## Commits and pull requests

- Write clear commit messages in the imperative mood (e.g. “Add password reset validation”).
- Describe **what** changed and **why** in the PR body. Link issues if applicable.
- Keep the diff readable; prefer small follow-up PRs over one huge batch.

## Documentation

- **User-facing API details:** `docs/README.md`
- **Project overview and scripts:** `README.md`

Update these when you change env vars, Docker layout, or major behavior.

## Code of conduct

Be respectful and constructive in issues and reviews. Assume good intent and keep feedback specific and actionable.

## Questions

Open an issue for bugs or design questions, or refer to NestJS documentation for framework behavior: [https://docs.nestjs.com](https://docs.nestjs.com).
