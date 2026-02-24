import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrganizationGuard from '@/components/OrganizationGuard';
import LocationForm from '@/domains/locations/components/LocationForm';
import { getLocation } from '@/domains/locations/actions';
import { notFound } from 'next/navigation';
import type { LocationFormData } from '@/domains/locations/schemas/locationSchema';
import { URLS } from '@/constants/routes';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Edit Location | Thrive',
  description: 'Edit location information',
};

export const dynamic = 'force-dynamic';

const EditLocationPage = async ({ params }: Props) => {
  const { id } = await params;

  const result = await getLocation(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const location = result.data;
  const addressJson = (location.addressJson as Record<string, any>) || {};

  // Transform location data to LocationFormData format
  const initialData: Partial<LocationFormData> = {
    name: location.name,
    address: {
      line1: addressJson.line1 || addressJson.street || '',
      line2: addressJson.line2 || '',
      city: addressJson.city || '',
      state: addressJson.state || '',
      postalCode: addressJson.postalCode || '',
      country: addressJson.country || 'CA',
      county: addressJson.county || '',
      latitude: addressJson.latitude,
      longitude: addressJson.longitude,
    },
    timezone: location.timezone || '',
    regionTag: location.regionTag || '',
    costCenterCode: location.costCenterCode || '',
    isActive: location.isActive,
  };

  return (
    <OrganizationGuard>
      <div className="dashboard-zoom-mobile w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <Link
            href={URLS.LOCATIONS}
            className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-[#000093] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Locations
          </Link>
          <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            Edit Location
          </h1>
          <p className="font-poppins mt-2 text-sm leading-relaxed text-[#4D4D4D]">
            Update location information. Changes will affect adjustor assignments and case
            management.
          </p>
        </div>
        <LocationForm locationId={id} initialData={initialData} />
      </div>
    </OrganizationGuard>
  );
};

export default EditLocationPage;
