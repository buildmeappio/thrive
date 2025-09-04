'use client';

import { useEffect, useState } from 'react';

import { acceptOrganizationAction, getOrganizationAction } from '@/features/organization.actions';
import { OrganizationStatus } from '@/constants/organizationStatus';
import { useSession } from 'next-auth/react';
import Welcome from './Welcome';
import Approved from './Approved';

interface Organization {
  id: string;
  status: string;
}

const OrganizationDashboard = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  // const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;

  const handleAccept = async () => {
    try {
      const response = await acceptOrganizationAction(organizationId!);
      if (response.success) {
        setOrganization(response.result);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        if (!organizationId) return;
        const response = await getOrganizationAction(organizationId);
        setOrganization(response.result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organization';
        console.log(errorMessage);
      }
      // finally {
      //   setLoading(false);
      // }
    };
    fetchOrganization();
  }, [organizationId]);

  return (
    <>
      {organization?.status === OrganizationStatus.PENDING ? <Welcome /> : <Approved />}
      <button
        onClick={handleAccept}
        className="mb-4 cursor-pointer rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
      >
        Accept
      </button>
    </>
  );
};

export default OrganizationDashboard;
