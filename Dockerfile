# ----------- 1. Build Stage -----------
FROM node:20.18.1-alpine AS builder

# Create app directory
WORKDIR /app

# Install system/build dependencies
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  openssl \
  libc6-compat

# Use reliable registry
RUN npm config set registry https://registry.npmjs.org/

# Copy and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy rest of the code
COPY . .

# Prisma: generate types (no DB access needed)
RUN npx prisma generate

# Optional: Prisma migrate if needed
# RUN npm run db:migrate-deploy

# Build the app
RUN npm run build


# ----------- 2. Runtime Stage -----------
FROM node:20.18.1-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install minimal runtime dependencies
RUN apk add --no-cache \
  openssl \
  curl \
  libc6-compat

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs


EXPOSE 3001

# Start command
CMD ["npm", "start"]
