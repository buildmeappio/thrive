# ----------- 1. Build Stage -----------
  FROM node:22-slim AS builder

  # Create app directory
  WORKDIR /app
  
  # Install system/build dependencies with robust error handling
  # Retry logic handles hash sum mismatches and mirror issues
  RUN for i in 1 2 3; do \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends --allow-unauthenticated \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && break || sleep 5; \
    done && \
    rm -rf /var/lib/apt/lists/*
  
  # Configure npm for maximum speed
  RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set progress false && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000
  
  # Copy and install dependencies
  COPY package.json package-lock.json* ./
  
  # Install dependencies with proper handling of optional/native modules
  RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --include=optional
  
  # Copy rest of the code
  COPY . .
  
  # Prisma: generate types (no DB access needed)
  RUN npx prisma generate
  
  # Optional: Prisma migrate if needed
  # RUN npm run db:migrate-deploy
  
  # Build the app with environment variables
  # Environment variables will be passed via --env-file during docker build
  # Increase Node.js heap size to prevent out of memory errors during build
  ENV NODE_OPTIONS="--max-old-space-size=4096"
  RUN npm run build
  
  
  # ----------- 2. Runtime Stage -----------
  FROM node:22-slim AS runner
  
  WORKDIR /app
  ENV NODE_ENV=production

  # Install minimal runtime dependencies with retry logic for hash mismatch issues
  RUN for i in 1 2 3; do \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends --allow-unauthenticated \
    openssl \
    curl \
    ca-certificates \
    && break || sleep 5; \
    done && \
    rm -rf /var/lib/apt/lists/*
  
  # Copy only necessary files
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/.next ./.next
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json ./package.json
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
  COPY --from=builder /app/next.config.ts ./next.config.ts
  COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
  COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
  COPY --from=builder /app/templates ./templates
  
  
  EXPOSE 3001
  
  # Health check using the /examiner/api/health endpoint
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/examiner/api/health || exit 1
  
  # Start command
  CMD ["npm", "start"]
  