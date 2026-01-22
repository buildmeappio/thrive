import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrganizationGuard from '@/components/OrganizationGuard';
import GroupForm from '@/domains/groups/components/GroupForm';
import { getGroup } from '@/domains/groups/actions';
import { notFound } from 'next/navigation';
import { URLS } from '@/constants/routes';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Edit Group | Thrive',
  description: 'Edit group information',
};

export const dynamic = 'force-dynamic';

const EditGroupPage = async ({ params }: Props) => {
  const { id } = await params;

  const result = await getGroup(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const group = result.data;

  const initialData = {
    name: group.name,
    roleId: group.roleId,
    scopeType: group.scopeType as 'ORG' | 'LOCATION_SET',
    locationIds: group.groupLocations.map(gl => gl.locationId),
    memberIds: group.groupMembers.map(gm => gm.organizationManagerId),
  };

  return (
    <OrganizationGuard>
      <div className="dashboard-zoom-mobile w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <Link
            href={URLS.GROUPS}
            className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-[#000093] transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>
          <h1 className="font-degular text-[32px] leading-tight font-semibold break-words text-[#000000] sm:text-[36px] md:text-[40px]">
            Edit Group
          </h1>
          <p className="font-poppins mt-2 text-sm leading-relaxed text-[#4D4D4D]">
            Update group information. Changes will affect member permissions and location access.
          </p>
        </div>
        <GroupForm groupId={id} initialData={initialData} />
      </div>
    </OrganizationGuard>
  );
};

export default EditGroupPage;
