import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/domains/auth/server/session';
import { URLS } from '@/constants/routes';
import getOrganization from '@/domains/organization/server/handlers/getOrganization';
import { type ReactNode } from 'react';

interface OrganizationGuardProps {
  children: ReactNode;
  allowNoAccess?: boolean; // Allow access even if no organization (for dashboard page to show restricted message)
}

const OrganizationGuard = async ({ children, allowNoAccess = false }: OrganizationGuardProps) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  // Check if user has organization access
  try {
    const orgResult = await getOrganization(user.id);
    if (!orgResult.success) {
      // User has no organization access
      if (!allowNoAccess) {
        // Redirect to dashboard which will show restricted access message
        redirect(URLS.DASHBOARD);
      }
    }
  } catch (error) {
    // Organization not found or user has no active organization
    if (!allowNoAccess) {
      // Redirect to dashboard which will show restricted access message
      redirect(URLS.DASHBOARD);
    }
  }

  return <>{children}</>;
};

export default OrganizationGuard;
