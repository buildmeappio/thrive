import { Metadata } from 'next';
import OrganizationGuard from '@/components/OrganizationGuard';
import { PermissionsPageContent } from '@/domains/permissions';

export const metadata: Metadata = {
  title: 'Permissions | Thrive',
  description: 'Manage permissions and role assignments',
};

export const dynamic = 'force-dynamic';

const PermissionsPage = async () => {
  return (
    <OrganizationGuard>
      <PermissionsPageContent />
    </OrganizationGuard>
  );
};

export default PermissionsPage;
