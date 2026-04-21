# Hyeameha API — production image
FROM node:22-alpine AS base

WORKDIR /app
RUN corepack enable && apk add --no-cache wget

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start:prod"]
