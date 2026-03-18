import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import CreateTransporterPageContent from '@/domains/transporter/components/CreateTransporterPageContent';
import { createTransporter } from '@/domains/transporter/server/actions/createTransporter';
import { saveTransporterAvailabilityAction } from '@/domains/transporter/server/actions/saveAvailability';

export const metadata: Metadata = {
  title: 'Create Transporter | Thrive Admin',
  description: 'Create a new medical transportation service provider',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

export default async function TenantCreateTransporterPage({ params }: Props) {
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

  return (
    <CreateTransporterPageContent
      onCreate={createTransporter}
      onSaveAvailability={saveTransporterAvailabilityAction}
      listPath="/transporter"
    />
  );
}
