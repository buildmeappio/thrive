import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import TransporterDetail from '@/domains/transporter/components/TransporterDetail';
import { getTransporterById } from '@/domains/transporter/server/actions/getTransporterById';
import { getTransporterAvailabilityAction } from '@/domains/transporter/server/actions/getAvailability';
import { updateTransporter } from '@/domains/transporter/server/actions/updateTransporter';
import { deleteTransporter } from '@/domains/transporter/server/actions/deleteTransporter';
import { saveTransporterAvailabilityAction } from '@/domains/transporter/server/actions/saveAvailability';
import { TransporterData } from '@/domains/transporter/types/TransporterData';

export const metadata: Metadata = {
  title: 'Transporter | Thrive Admin',
  description: 'Transporter details',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant transporter detail page. Uses same TransporterDetail component; tenant DB is resolved via getTenantDbFromHeaders in the actions.
 */
export default async function TenantTransporterDetailPage({ params }: Props) {
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

  const result = await getTransporterById(id);

  if (!result.success) {
    notFound();
  }

  const availabilityResult = await getTransporterAvailabilityAction({
    transporterId: id,
  });
  const availability =
    availabilityResult.success && availabilityResult.data ? availabilityResult.data : null;

  return (
    <TransporterDetail
      transporter={result.data as unknown as TransporterData}
      initialAvailability={availability}
      onUpdate={updateTransporter}
      onDelete={deleteTransporter}
      onSaveAvailability={saveTransporterAvailabilityAction}
      listPath="/transporter"
    />
  );
}
