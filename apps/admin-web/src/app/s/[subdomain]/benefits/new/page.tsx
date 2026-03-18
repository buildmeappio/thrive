import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import {
  getTenantExaminationTypes,
  createTenantBenefit,
} from '@/domains/tenant-benefit/actions/benefit.actions';
import BenefitForm from '@/domains/benefits/components/BenefitForm';

export const metadata: Metadata = {
  title: 'Add New Benefit | Thrive Admin',
  description: 'Add a new benefit',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant benefit new page. Uses shared BenefitForm with tenant create and exam types.
 */
export default async function TenantBenefitNewPage({ params }: Props) {
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

  const examTypesResult = await getTenantExaminationTypes();
  const examinationTypes = examTypesResult.success ? (examTypesResult.data ?? []) : [];

  return (
    <BenefitForm
      mode="create"
      basePath="/benefits"
      onCreate={createTenantBenefit}
      examinationTypes={examinationTypes}
    />
  );
}
