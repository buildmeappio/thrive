import { PrismaClient, Prisma } from "@prisma/client";
import { Pool, PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const config: PoolConfig = {
  connectionString,
};

// Configure SSL based on environment and explicit settings
// Allow SSL configuration in any environment if explicitly requested
const sslRequired = process.env.DATABASE_SSL_REQUIRED === "true";
const sslDisabled = process.env.DATABASE_SSL_REQUIRED === "false";

if (sslRequired) {
  // SSL explicitly required
  config.ssl = {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
  };
} else if (sslDisabled) {
  // SSL explicitly disabled - ensure no SSL config is set
  // This helps when connection string has SSL params but DB doesn't support it
  config.ssl = false;
} else if (process.env.NODE_ENV === "production") {
  // Production: default to SSL unless explicitly disabled
  config.ssl = {
    rejectUnauthorized: true,
  };
}

const pool = new Pool(config);

// Add error handler for connection issues
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

// Test connection lazily at runtime (not during build)
// Only run in development and when not in build phase
if (process.env.NODE_ENV === "development" && typeof window === "undefined" && !process.env.NEXT_PHASE) {
  // Use setImmediate to defer execution until after module initialization
  setImmediate(() => {
    pool.connect()
      .then((client) => {
        console.log("✅ Database connection successful");
        client.release();
      })
      .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
        console.error("Check your DATABASE_URL configuration:");
        console.error("- Verify username and password are correct");
        console.error("- Verify database name exists and user has access");
        console.error("- Verify host and port are correct");
        console.error("- Check if SSL is required (set DATABASE_SSL_REQUIRED=true/false)");
      });
  });
}

const adapter = new PrismaPg(pool);

// Prisma Client configuration
// For Prisma 7+, we need to provide an adapter for direct database connection
const prismaClientOptions: Prisma.PrismaClientOptions = {
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? [
          { level: "query", emit: "event" },
          { level: "error", emit: "stdout" },
          { level: "warn", emit: "stdout" },
        ]
      : [{ level: "error", emit: "stdout" }],
  errorFormat: "pretty",
};

// Create Prisma Client instance
const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

// Log queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (_e: any) => {
    // console.log("Query: " + _e.query);
    // console.log("Params: " + _e.params);
    // console.log("Duration: " + _e.duration + "ms");
  });
}

// Prevent multiple instances in development (Next.js hot reload)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
