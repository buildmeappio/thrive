'use client';

import Welcome from './Welcome';
import Approved from './Approved';
import NoOrganizationAccess from './NoOrganizationAccess';
import { type getOrganization } from '../actions';

type OrganizationDashboardProps = {
  organization: Awaited<ReturnType<typeof getOrganization>>['result'] | null;
  hasError?: boolean;
};
const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  organization,
  hasError = false,
}) => {
  // If there's an error or no organization, show no access screen
  if (hasError || !organization) {
    return <NoOrganizationAccess />;
  }

  // Show welcome screen if organization is not authorized
  if (!organization.isAuthorized) {
    return <Welcome />;
  }

  // Show approved dashboard
  return <Approved />;
};

export default OrganizationDashboard;
