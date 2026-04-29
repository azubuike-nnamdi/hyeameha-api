# Hyeameha API — production image
FROM node:22-alpine AS base

WORKDIR /app
RUN corepack enable && apk add --no-cache wget

# preinstall runs before the full tree is copied; keep enforce-pnpm available.
# Skip Husky in the image (no git hooks needed in containers).
ENV HUSKY=0
COPY package.json pnpm-lock.yaml ./
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start:prod"]
