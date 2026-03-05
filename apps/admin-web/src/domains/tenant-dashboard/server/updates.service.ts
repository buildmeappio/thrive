import 'server-only';
import { PrismaClient } from '@thrive/database';
import { DashboardUpdate } from '@/domains/dashboard/types/updates.types';

/**
 * Tenant-aware updates service
 * Simplified version - returns empty for now to avoid NextAuth dependencies
 */
export async function getTenantRecentUpdates(
  prisma: PrismaClient,
  limit = 9
): Promise<DashboardUpdate[]> {
  // For now, return empty array - can be implemented later with tenant-specific logic
  // This avoids NextAuth dependencies
  return [];
}
