import { PrismaClient, Prisma } from "@thrive/database";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

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
