import { Metadata } from 'next';
import OrganizationGuard from '@/components/OrganizationGuard';
import { RolesPageContent } from '@/domains/roles';

export const metadata: Metadata = {
  title: 'Roles | Thrive',
  description: 'Manage organization roles',
};

export const dynamic = 'force-dynamic';

const RolesPage = async () => {
  return (
    <OrganizationGuard>
      <RolesPageContent />
    </OrganizationGuard>
  );
};

export default RolesPage;
