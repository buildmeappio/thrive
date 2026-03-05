import 'server-only';
import { PrismaClient } from '@thrive/database';
import { DashboardMessage } from '@/domains/dashboard/types/messages.types';

/**
 * Tenant-aware messages service
 * Simplified version - returns empty for now to avoid NextAuth dependencies
 */
export async function getTenantRecentMessages(
  prisma: PrismaClient,
  limit = 5
): Promise<DashboardMessage[]> {
  // For now, return empty array - can be implemented later with tenant-specific logic
  // This avoids NextAuth dependencies
  return [];
}

export async function getTenantUnreadMessagesCount(prisma: PrismaClient): Promise<number> {
  return 0;
}
