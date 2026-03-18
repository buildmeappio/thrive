import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import InterpreterDetail from '@/domains/interpreter/components/InterpreterDetail';
import {
  getInterpreterById,
  getInterpreterAvailabilityAction,
  getLanguages,
  updateInterpreter,
  deleteInterpreter,
  saveInterpreterAvailabilityAction,
} from '@/domains/interpreter/actions';

export const metadata: Metadata = {
  title: 'Interpreter | Thrive Admin',
  description: 'Interpreter details',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant interpreter detail page. Uses same InterpreterDetail component; tenant DB is resolved via getTenantDbFromHeaders in the actions.
 */
export default async function TenantInterpreterDetailPage({ params }: Props) {
  const { subdomain, id } = await params;

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

  try {
    const [interpreter, availabilityResult, languages] = await Promise.all([
      getInterpreterById(id),
      getInterpreterAvailabilityAction({ interpreterId: id }),
      getLanguages(),
    ]);
    const availability =
      availabilityResult.success && availabilityResult.data ? availabilityResult.data : null;

    return (
      <InterpreterDetail
        interpreter={interpreter}
        initialAvailability={availability}
        languages={languages}
        onUpdate={updateInterpreter}
        onDelete={deleteInterpreter}
        onSaveAvailability={saveInterpreterAvailabilityAction}
        wrapInShell={false}
        listPath="/interpreter"
      />
    );
  } catch {
    notFound();
  }
}
