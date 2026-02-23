import { Metadata } from 'next';
import OrganizationGuard from '@/components/OrganizationGuard';
import { LocationsPageContent } from '@/domains/locations';

export const metadata: Metadata = {
  title: 'Locations | Thrive',
  description: 'Manage organization locations',
};

export const dynamic = 'force-dynamic';

const LocationsPage = async () => {
  return (
    <OrganizationGuard>
      <LocationsPageContent />
    </OrganizationGuard>
  );
};

export default LocationsPage;
