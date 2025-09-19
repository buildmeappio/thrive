'use client';

import Welcome from './Welcome';
import Approved from './Approved';
import { type getOrganization } from '../actions';

type OrganizationDashboardProps = {
  organization: Awaited<ReturnType<typeof getOrganization>>['result'];
};
const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ organization }) => {
  return <>{organization?.status === 'PENDING' ? <Welcome /> : <Approved />}</>;
};

export default OrganizationDashboard;
