import getDepartments from '@/domains/auth/server/handlers/getDepartments';
import getOrganizationTypes from '@/domains/organization/server/handlers/getOrganizationTypes';
import { type Metadata } from 'next';
import { HttpError } from '@/utils/httpError';
import UpdateOrganizationForm from '@/domains/auth/components/updateOrganization';

export const metadata: Metadata = {
  title: 'Update Organization Information | Thrive',
  description: 'Update your organization information on Thrive',
};

export const dynamic = 'force-dynamic';
export const maxDuration = 25;

const UpdateOrganizationInfoPage = async () => {
  try {
    const [organizationTypes, departmentTypes] = await Promise.all([
      getOrganizationTypes(),
      getDepartments(),
    ]);
    return (
      <UpdateOrganizationForm
        organizationTypes={organizationTypes}
        departmentTypes={departmentTypes}
      />
    );
  } catch (error) {
    let message = 'Failed to load organization data';
    if (error instanceof HttpError) {
      message = error.message;
    }
    return <div>Error: {message}</div>;
  }
};

export default UpdateOrganizationInfoPage;
