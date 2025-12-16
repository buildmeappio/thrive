import { PrismaClient, Prisma } from "@prisma/client";
import { Pool, PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create PostgreSQL connection pool
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Check if SSL is explicitly required
const sslRequired = process.env.DATABASE_SSL_REQUIRED === "true";

// Remove SSL parameters from connection string if SSL is not required
// This prevents SSL from being forced via connection string parameters
if (!sslRequired) {
  try {
    const url = new URL(connectionString);
    const params = new URLSearchParams(url.search);

    // Remove all SSL-related parameters
    const sslParams = [
      "sslmode",
      "ssl",
      "sslcert",
      "sslkey",
      "sslrootcert",
      "sslcrl",
    ];
    sslParams.forEach((param) => params.delete(param));

    // Reconstruct URL without SSL parameters
    url.search = params.toString();
    connectionString = url.toString();
  } catch (e) {
    // If URL parsing fails, use regex to remove SSL parameters
    connectionString = connectionString
      .replace(/[?&]sslmode=[^&]*/gi, "")
      .replace(/[?&]ssl=[^&]*/gi, "")
      .replace(/[?&]sslcert=[^&]*/gi, "")
      .replace(/[?&]sslkey=[^&]*/gi, "")
      .replace(/[?&]sslrootcert=[^&]*/gi, "")
      .replace(/[?&]sslcrl=[^&]*/gi, "");
  }
}

const config: PoolConfig = {
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Explicitly configure SSL - disable unless explicitly required
config.ssl = sslRequired
  ? {
      rejectUnauthorized: true,
    }
  : false;

// Create pool - it won't connect until actually used
// The pool is lazy and only connects when a query is executed
const pool = new Pool(config);

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
// Only register handler once and only in server environment
if (typeof window === "undefined") {
  // Use a flag to prevent multiple registrations
  if (!(global as any).__prismaDisconnectHandlerRegistered) {
    process.once("beforeExit", async () => {
      await prisma.$disconnect();
    });
    (global as any).__prismaDisconnectHandlerRegistered = true;
  }
}

export default prisma;
