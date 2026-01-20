import { Metadata } from 'next';
import userActions from '@/domains/user/actions';
import UsersPageContent from '@/domains/user/components/UsersPageContent';
import OrganizationGuard from '@/components/OrganizationGuard';

export const metadata: Metadata = {
  title: 'Users | Thrive',
  description: 'Manage organization users',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const [users, invitations] = await Promise.all([
    userActions.listUsers(),
    userActions.listInvitations(),
  ]);
  return (
    <OrganizationGuard>
      <UsersPageContent initialUsers={users} initialInvitations={invitations} />
    </OrganizationGuard>
  );
};

export default Page;
