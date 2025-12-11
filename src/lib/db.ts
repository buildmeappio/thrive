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
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
};

// SSL configuration for production
// Most production databases (AWS RDS, Azure, etc.) require SSL
if (process.env.NODE_ENV === "production") {
  // Check if SSL should be disabled explicitly
  const sslDisabled = process.env.DATABASE_SSL_REQUIRED === "false";

  if (!sslDisabled) {
    // Enable SSL - most production databases require it
    // rejectUnauthorized: false allows self-signed certificates (common in managed databases)
    // Set DATABASE_SSL_REQUIRED=true if you want strict certificate validation
    const strictSSL = process.env.DATABASE_SSL_REQUIRED === "true";
    config.ssl = {
      rejectUnauthorized: strictSSL,
    };
  }
}

const pool = new Pool(config);

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

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
  prisma.$on("query" as never, (e: any) => {
    // console.log("Query: " + e.query);
    // console.log("Params: " + e.params);
    // console.log("Duration: " + e.duration + "ms");
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
