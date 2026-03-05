import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantInterpreterService } from '@/domains/tenant-interpreter/server/interpreter.service';
import InterpreterPageContent from '@/domains/tenant-interpreter/components/InterpreterPageContent';

export const metadata: Metadata = {
  title: 'Interpreters | Thrive Admin',
  description: 'Interpreters',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific interpreters page
 */
const Page = async ({ params }: Props) => {
  const { subdomain } = await params;

  // Get tenant from master DB
  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  // Get tenant session from cookies
  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  // Get tenant database connection
  const tenantDb = await getTenantDb(tenant.id);

  // Create tenant interpreter service
  const interpreterService = createTenantInterpreterService(tenantDb);

  // Fetch interpreter data and languages
  const [result, languages] = await Promise.all([
    interpreterService.getInterpreters({ page: 1, pageSize: 20 }),
    interpreterService.getLanguages(),
  ]);

  return (
    <InterpreterPageContent
      data={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      languages={languages}
    />
  );
};

export default Page;
