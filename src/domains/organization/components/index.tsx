'use client';

import Welcome from './Welcome';
import Approved from './Approved';
import { useState } from 'react';
import { acceptOrganization, type getOrganization } from '../actions';

type OrganizationDashboardProps = {
  organization: Awaited<ReturnType<typeof getOrganization>>['result'];
};
const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ organization }) => {
  const [organizationData, setOrganizationData] = useState(organization);

  const handleAccept = async () => {
    const response = await acceptOrganization();
    setOrganizationData(response.result);
  };

  return (
    <>
      {organizationData?.status === 'PENDING' ? <Welcome /> : <Approved />}
      {organizationData?.status === 'PENDING' && (
        <button
          onClick={handleAccept}
          className="mt-8 mb-4 cursor-pointer rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Accept yourself
        </button>
      )}
    </>
  );
};

export default OrganizationDashboard;
