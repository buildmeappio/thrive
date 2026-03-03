/**
 * Tenant-aware Prisma client proxy.
 *
 * All 70+ service files import `prisma from '@/lib/db'` and call it synchronously
 * (e.g. `prisma.user.findMany(...)`). This transparent Proxy intercepts those calls
 * and lazily resolves the correct tenant database on every query via the
 * x-tenant-slug request header set by middleware.
 *
 * Supports:
 *   - Model methods:     prisma.user.findMany(), prisma.role.create(), etc.
 *   - Dollar methods:    prisma.$transaction(fn), prisma.$disconnect(), etc.
 *
 * Note: Array-style $transaction([p1, p2]) is not supported. Use the callback
 * form prisma.$transaction(async tx => { ... }) instead.
 */
import { getTenantDb } from './tenant-db';
import type { PrismaClient } from '@thrive/database';

export { getTenantDb, getClientBySlug } from './tenant-db';

const db = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    // Each property access (model name or $method) returns a proxy-function.
    // The apply trap handles direct calls: prisma.$transaction(fn)
    // The inner get trap handles method calls: prisma.user.findMany(args)
    return new Proxy(function () {} as any, {
      get(_, method: string) {
        return (...args: unknown[]) =>
          getTenantDb().then((client: any) => client[prop][method](...args));
      },
      apply(_, _thisArg, args) {
        return getTenantDb().then((client: any) => client[prop](...args));
      },
    });
  },
});

export default db;
