# Prisma DB Migrations & Seeders Dockerfile
FROM node:22-slim

WORKDIR /app

# Install system dependencies for Prisma
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy Prisma schema and migration files
COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Default command: run migrations
CMD ["npx", "prisma", "migrate", "deploy"]

