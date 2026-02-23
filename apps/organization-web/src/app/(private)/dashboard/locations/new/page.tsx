import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrganizationGuard from '@/components/OrganizationGuard';
import LocationForm from '@/domains/locations/components/LocationForm';
import { URLS } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Create Location | Thrive',
  description: 'Create a new location for your organization',
};

export const dynamic = 'force-dynamic';

const CreateLocationPage = () => {
  return (
    <OrganizationGuard>
      <div className="dashboard-zoom-mobile w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <Link
            href={URLS.LOCATIONS}
            className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-[#000093] transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Locations
          </Link>
          <h1 className="font-degular text-[20px] leading-tight font-semibold break-words text-[#000000] sm:text-[28px] lg:text-[36px]">
            Create New Location
          </h1>
          <p className="font-poppins mt-2 text-sm leading-relaxed text-[#4D4D4D]">
            Add a new location for your organization. This location will be used for adjustor
            assignments and case management.
          </p>
        </div>
        <LocationForm />
      </div>
    </OrganizationGuard>
  );
};

export default CreateLocationPage;
