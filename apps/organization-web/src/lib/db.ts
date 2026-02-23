import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import env from '@/config/env';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create PostgreSQL connection pool
const connectionString = env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({
  connectionString,
});

// Prisma Client configuration
// For Prisma 7+, we need to provide an adapter for direct database connection
const prismaClientOptions: Prisma.PrismaClientOptions = {
  adapter,
  log:
    env.NODE_ENV === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
  errorFormat: 'pretty',
};

// Create Prisma Client instance
const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

// Log queries in development
if (env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (_e: any) => {
    console.log('Query: ' + _e.query);
    console.log('Params: ' + _e.params);
    console.log('Duration: ' + _e.duration + 'ms');
  });
}

// Prevent multiple instances in development (Next.js hot reload)
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
