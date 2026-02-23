import { Metadata } from 'next';
import OrganizationGuard from '@/components/OrganizationGuard';
import { GroupsPageContent } from '@/domains/groups';

export const metadata: Metadata = {
  title: 'Groups | Thrive',
  description: 'Manage user groups',
};

export const dynamic = 'force-dynamic';

const GroupsPage = async () => {
  return (
    <OrganizationGuard>
      <GroupsPageContent />
    </OrganizationGuard>
  );
};

export default GroupsPage;
