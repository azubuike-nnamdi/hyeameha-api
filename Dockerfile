# Hyeameha API — production image

# ---- build: full install, compile, then drop devDependencies ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
# Skip Husky in the image (no git hooks needed in containers).
ENV HUSKY=0
# preinstall runs before the full tree is copied; keep enforce-pnpm available.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm build && pnpm prune --prod --ignore-scripts

# ---- runtime: compiled output + production dependencies, non-root ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
# Migrations: docker compose run --rm hyeameha-backend node ./node_modules/typeorm/cli.js -d dist/database/data-source.js migration:run
CMD ["node", "dist/main"]
