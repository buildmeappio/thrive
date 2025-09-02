import { OrganizationGettingStarted } from '@/shared/components/gettingStarted/OrganizationGettingStarted';
import { AuthNavbar } from '@/shared/components/layout';

const GettingStartedPageClient = () => {
  return (
    <>
      <AuthNavbar />
      <OrganizationGettingStarted />
    </>
  );
};
export default GettingStartedPageClient;
