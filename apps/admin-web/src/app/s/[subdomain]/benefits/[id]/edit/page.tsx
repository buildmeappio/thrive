import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import {
  getTenantBenefitById,
  updateTenantBenefit,
  getTenantExaminationTypes,
} from '@/domains/tenant-benefit/actions/benefit.actions';
import BenefitForm from '@/domains/benefits/components/BenefitForm';

export const metadata: Metadata = {
  title: 'Edit Benefit | Thrive Admin',
  description: 'Edit benefit details',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant benefit edit page. Uses shared BenefitForm with tenant actions and exam types.
 */
export default async function TenantBenefitEditPage({ params }: Props) {
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

  const [benefitResult, examTypesResult] = await Promise.all([
    getTenantBenefitById(id),
    getTenantExaminationTypes(),
  ]);

  if (!benefitResult.success || !benefitResult.data) {
    notFound();
  }

  const examinationTypes = examTypesResult.success ? (examTypesResult.data ?? []) : [];

  return (
    <BenefitForm
      mode="edit"
      benefit={benefitResult.data}
      basePath="/benefits"
      onUpdate={updateTenantBenefit}
      examinationTypes={examinationTypes}
    />
  );
}
