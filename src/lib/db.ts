import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma Client configuration
// For Prisma 7+, connection is configured via prisma.config.ts
// The adapter is optional - Prisma will use the connection from config
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
  errorFormat: 'pretty',
};

// Create Prisma Client instance
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaClientOptions);

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  });
}

// Prevent multiple instances in development (Next.js hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;