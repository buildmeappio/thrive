import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import InterpreterCreateContent from '@/domains/interpreter/components/InterpreterCreateContent';

export const metadata: Metadata = {
  title: 'Add New Interpreter | Thrive Admin',
  description: 'Add New Interpreter',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

export default async function TenantNewInterpreterPage({ params }: Props) {
  const { subdomain } = await params;

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  return <InterpreterCreateContent listPath="/interpreter" wrapInShell={false} />;
}
