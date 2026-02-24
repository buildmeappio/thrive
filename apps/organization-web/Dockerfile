# Monorepo-aware Dockerfile for organization-web
# Build from repo root: docker build -f apps/organization-web/Dockerfile .

FROM node:24-slim AS builder

WORKDIR /app

RUN for i in 1 2 3; do \
  rm -rf /var/lib/apt/lists/* && apt-get clean && apt-get update --fix-missing && \
  apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates && break || sleep 5; \
  done && rm -rf /var/lib/apt/lists/*

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database ./packages/database
COPY apps/organization-web ./apps/organization-web

RUN pnpm install --frozen-lockfile

ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN pnpm run build:organization

# ----------- Runtime -----------
FROM node:24-slim AS runner

WORKDIR /app

RUN for i in 1 2 3; do \
  rm -rf /var/lib/apt/lists/* && apt-get clean && apt-get update --fix-missing && \
  apt-get install -y --no-install-recommends openssl curl ca-certificates && break || sleep 5; \
  done && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=768"

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/organization-web ./apps/organization-web

RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod
RUN pnpm --filter @thrive/database run generate

WORKDIR /app/apps/organization-web

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3002/organization/api/health || exit 1

CMD ["pnpm", "start"]
