import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrganizationGuard from '@/components/OrganizationGuard';
import GroupForm from '@/domains/groups/components/GroupForm';
import { URLS } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Create Group | Thrive',
  description: 'Create a new group for your organization',
};

export const dynamic = 'force-dynamic';

const CreateGroupPage = () => {
  return (
    <OrganizationGuard>
      <div className="dashboard-zoom-mobile w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <Link
            href={URLS.GROUPS}
            className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-[#000093] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>
          <h1 className="font-degular break-words text-[32px] font-semibold leading-tight text-[#000000] sm:text-[36px] md:text-[40px]">
            Create New Group
          </h1>
          <p className="font-poppins mt-2 text-sm leading-relaxed text-[#4D4D4D]">
            Create a group with role, locations, and members. Groups help organize users and manage
            permissions.
          </p>
        </div>
        <GroupForm />
      </div>
    </OrganizationGuard>
  );
};

export default CreateGroupPage;
