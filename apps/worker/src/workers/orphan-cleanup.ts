import masterDb from '@thrive/database-master/db';

const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Delete DRAFT tenants with no Subscription older than 24h (abandoned checkouts).
 * Frees slugs for reuse and keeps the tenant table clean.
 */
export async function deleteOrphanDraftTenants(): Promise<number> {
  const cutoff = new Date(Date.now() - ORPHAN_AGE_MS);

  const orphans = await masterDb.tenant.findMany({
    where: {
      status: 'DRAFT',
      createdAt: { lt: cutoff },
      subscription: { is: null },
    },
    select: { id: true },
  });

  for (const tenant of orphans) {
    await masterDb.tenant.delete({ where: { id: tenant.id } });
  }

  return orphans.length;
}
