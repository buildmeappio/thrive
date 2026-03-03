'use server';
import { isSlugAvailable } from '@/domains/tenant/server/tenant.service';

export async function checkSlugAction(slug: string): Promise<{ available: boolean }> {
  if (!slug || slug.length < 3) return { available: false };

  // Only allow lowercase alphanumeric and hyphens
  const valid = /^[a-z0-9-]+$/.test(slug);
  if (!valid) return { available: false };

  const available = await isSlugAvailable(slug);
  return { available };
}
