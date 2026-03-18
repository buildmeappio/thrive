'use client';

import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { ArrowLeft } from 'lucide-react';
import { capitalizeWords, formatText } from '@/utils/text';
import Link from 'next/link';

type OrganizationDetailData = {
  id: string;
  name: string;
  type: string | null;
  website: string | null;
  status: string | null;
  address: {
    id: string;
    address: string;
    street: string | null;
    province: string | null;
    city: string | null;
    postalCode: string | null;
    suite: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

type OrganizationDetailProps = {
  organization: OrganizationDetailData;
};

export default function TenantOrganizationDetail({ organization }: OrganizationDetailProps) {
  const type = organization.type ? formatText(organization.type) : '-';

  return (
    <>
      {/* Back Button and Organization Name Heading */}
      <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/organization" className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            {capitalizeWords(organization.name)}
          </h1>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        {/* Organization Details Card */}
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
          <Section title="Organization Details">
            <FieldRow
              label="Organization Name"
              value={capitalizeWords(organization.name)}
              type="text"
            />
            <FieldRow label="Organization Type" value={type} type="text" />
            <FieldRow
              label="Address"
              value={
                organization.address
                  ? [
                      organization.address.suite,
                      organization.address.street,
                      organization.address.city,
                      organization.address.province,
                      organization.address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ') || organization.address.address
                  : '-'
              }
              type="text"
            />
            <FieldRow label="Website" value={organization.website || '-'} type="text" />
            <FieldRow
              label="Status"
              value={organization.status ? formatText(organization.status) : '-'}
              type="text"
            />
            <FieldRow
              label="Created At"
              value={new Date(organization.createdAt).toLocaleDateString()}
              type="text"
            />
            <FieldRow
              label="Updated At"
              value={new Date(organization.updatedAt).toLocaleDateString()}
              type="text"
            />
          </Section>
        </div>
      </div>
    </>
  );
}
