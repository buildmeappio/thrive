import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantTaxonomyService } from '@/domains/tenant-taxonomy/server/taxonomy.service';
import TaxonomyPageContent from '@/domains/tenant-taxonomy/components/TaxonomyPageContent';
import { TaxonomyType } from '@/domains/tenant-taxonomy/types/TaxonomyData';

export const metadata: Metadata = {
  title: 'Taxonomies | Thrive Admin',
  description: 'Taxonomies',
};

export const dynamic = 'force-dynamic';

// Map URL-friendly type names to TaxonomyType
const typeMap: Record<string, TaxonomyType> = {
  'case-types': 'caseType',
  caseStatus: 'caseStatus',
  claimType: 'claimType',
  department: 'department',
  examinationType: 'examinationType',
  examinationTypeBenefit: 'examinationTypeBenefit',
  language: 'language',
  organizationType: 'organizationType',
  role: 'role',
  maximumDistanceTravel: 'maximumDistanceTravel',
  yearsOfExperience: 'yearsOfExperience',
  configuration: 'configuration',
  assessmentType: 'assessmentType',
  professionalTitle: 'professionalTitle',
};

const validTypes: TaxonomyType[] = [
  'caseStatus',
  'caseType',
  'claimType',
  'department',
  'examinationType',
  'examinationTypeBenefit',
  'language',
  'organizationType',
  'role',
  'maximumDistanceTravel',
  'yearsOfExperience',
  'configuration',
  'assessmentType',
  'professionalTitle',
];

type Props = {
  params: Promise<{ subdomain: string; type: string }>;
};

/**
 * Tenant-specific taxonomy page with dynamic type
 */
const Page = async ({ params }: Props) => {
  const { subdomain, type } = await params;

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

  // Map URL type to TaxonomyType
  const taxonomyType = typeMap[type] || (type as TaxonomyType);

  // Validate the type
  if (!validTypes.includes(taxonomyType)) {
    notFound();
  }

  // Get tenant database connection
  const tenantDb = await getTenantDb(tenant.id);

  // Create tenant taxonomy service
  const taxonomyService = createTenantTaxonomyService(tenantDb);

  // Fetch taxonomy data
  const data = await taxonomyService.getTaxonomies(taxonomyType);

  return <TaxonomyPageContent type={taxonomyType} data={data} />;
};

export default Page;
