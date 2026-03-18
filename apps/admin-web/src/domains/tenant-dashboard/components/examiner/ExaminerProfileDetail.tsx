'use client';

import React from 'react';
import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { ExaminerProfileData } from '@/domains/examiner/types/ExaminerProfileData';
import { ArrowLeft } from 'lucide-react';
import { capitalizeWords } from '@/utils/text';
import Link from 'next/link';

type Props = { profile: ExaminerProfileData };

const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Utility function to format professional title: name in uppercase, description in title case in brackets
const formatProfessionalTitle = (name?: string, description?: string): string => {
  if (!name) return '-';
  const nameUpper = name.toUpperCase();
  if (description) {
    const descriptionTitleCase = capitalizeWords(description);
    return `${nameUpper} (${descriptionTitleCase})`;
  }
  return nameUpper;
};

const ExaminerProfileDetail: React.FC<Props> = ({ profile }) => {
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return (
    <>
      {/* Back Button and Profile Heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-4">
          <Link href="/examiner" className="flex-shrink-0">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <h1 className="font-degular min-w-0 break-words text-[18px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            Examiner{' '}
            <span className="break-words bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
              {capitalizeWords(fullName || profile.email)}
            </span>{' '}
            Profile
          </h1>
        </div>
      </div>

      <div className="flex w-full flex-col items-center">
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Section 1: Profile Info */}
              <Section title="Professional Profile">
                <FieldRow label="First Name" value={profile.firstName || '-'} type="text" />
                <FieldRow label="Last Name" value={profile.lastName || '-'} type="text" />
                <FieldRow label="Email Address" value={profile.email} type="text" />
                <FieldRow
                  label="Professional Title"
                  value={formatProfessionalTitle(
                    profile.professionalTitle,
                    profile.professionalTitleDescription
                  )}
                  type="text"
                />
                <FieldRow
                  label="Years of IME Experience"
                  value={profile.yearsOfIMEExperience || '-'}
                  type="text"
                />
                <FieldRow label="Clinic Name" value={profile.clinicName || '-'} type="text" />
                <FieldRow label="Clinic Address" value={profile.clinicAddress || '-'} type="text" />
                {profile.bio && <FieldRow label="Bio" value={profile.bio} type="text" />}
              </Section>

              {/* Section 2: Services & Assessment Types */}
              <Section title="Services & Assessment Types">
                <FieldRow
                  label="Assessment Types"
                  value={
                    profile.assessmentTypes && profile.assessmentTypes.length > 0
                      ? profile.assessmentTypes.map(formatText).join(', ')
                      : '-'
                  }
                  type="text"
                />
                {profile.assessmentTypeOther && (
                  <FieldRow
                    label="Other Assessment Types"
                    value={profile.assessmentTypeOther}
                    type="text"
                  />
                )}
                <FieldRow
                  label="Accepts Virtual Assessments"
                  value={profile.acceptVirtualAssessments ? 'Yes' : 'No'}
                  type="text"
                />
                <FieldRow
                  label="Accepts In-Person Assessments"
                  value={profile.acceptInPersonAssessments ? 'Yes' : 'No'}
                  type="text"
                />
                <FieldRow
                  label="Travels to Claimants"
                  value={profile.travelToClaimants ? 'Yes' : 'No'}
                  type="text"
                />
                {profile.maxTravelDistance && (
                  <FieldRow
                    label="Max Travel Distance"
                    value={profile.maxTravelDistance}
                    type="text"
                  />
                )}
              </Section>

              {/* Section 3: Availability Preferences */}
              <Section title="Availability Preferences">
                {profile.maxIMEsPerWeek && (
                  <FieldRow label="Max IMEs Per Week" value={profile.maxIMEsPerWeek} type="text" />
                )}
                {profile.minimumNoticeValue && profile.minimumNoticeUnit && (
                  <FieldRow
                    label="Minimum Notice"
                    value={`${profile.minimumNoticeValue} ${profile.minimumNoticeUnit}`}
                    type="text"
                  />
                )}
              </Section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Section 4: Payout Details */}
              <Section title="Payout Details">
                <FieldRow
                  label="Institution Number"
                  value={profile.institutionNumber || '-'}
                  type="text"
                />
                <FieldRow label="Transit Number" value={profile.transitNumber || '-'} type="text" />
                <FieldRow label="Account Number" value={profile.accountNumber || '-'} type="text" />
              </Section>

              {/* Section 5: Compliance */}
              <Section title="Compliance">
                <FieldRow
                  label="PHIPA Compliance"
                  value={profile.phipaCompliance ? 'Yes' : 'No'}
                  type="text"
                />
                <FieldRow
                  label="PIPEDA Compliance"
                  value={profile.pipedaCompliance ? 'Yes' : 'No'}
                  type="text"
                />
                <FieldRow
                  label="Medical License Active"
                  value={profile.medicalLicenseActive ? 'Yes' : 'No'}
                  type="text"
                />
              </Section>

              {/* Section 6: Documents */}
              <Section title="Documents">
                {profile.medicalLicenseUrls && profile.medicalLicenseUrls.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-poppins text-sm font-medium text-black sm:text-base">
                      Medical Licenses
                    </label>
                    <div className="flex flex-col gap-1">
                      {profile.medicalLicenseUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#00A8FF] hover:underline"
                        >
                          {profile.medicalLicenseNames?.[index] || `License ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <FieldRow label="Medical Licenses" value="-" type="text" />
                )}

                {profile.governmentIdUrl ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-poppins text-sm font-medium text-black sm:text-base">
                      Government ID
                    </label>
                    <a
                      href={profile.governmentIdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#00A8FF] hover:underline"
                    >
                      {profile.governmentIdName || 'Government ID'}
                    </a>
                  </div>
                ) : (
                  <FieldRow label="Government ID" value="-" type="text" />
                )}

                {profile.resumeUrl ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-poppins text-sm font-medium text-black sm:text-base">
                      Resume
                    </label>
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#00A8FF] hover:underline"
                    >
                      {profile.resumeName || 'Resume'}
                    </a>
                  </div>
                ) : (
                  <FieldRow label="Resume" value="-" type="text" />
                )}

                {profile.insuranceUrl ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-poppins text-sm font-medium text-black sm:text-base">
                      Insurance
                    </label>
                    <a
                      href={profile.insuranceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#00A8FF] hover:underline"
                    >
                      {profile.insuranceName || 'Insurance'}
                    </a>
                  </div>
                ) : (
                  <FieldRow label="Insurance" value="-" type="text" />
                )}

                {profile.specialtyCertificatesUrls &&
                profile.specialtyCertificatesUrls.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-poppins text-sm font-medium text-black sm:text-base">
                      Specialty Certificates
                    </label>
                    <div className="flex flex-col gap-1">
                      {profile.specialtyCertificatesUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#00A8FF] hover:underline"
                        >
                          {profile.specialtyCertificatesNames?.[index] ||
                            `Certificate ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <FieldRow label="Specialty Certificates" value="-" type="text" />
                )}
              </Section>

              {/* Section 7: Timestamps */}
              <Section title="Timestamps">
                <FieldRow
                  label="Created At"
                  value={new Date(profile.createdAt).toLocaleDateString()}
                  type="text"
                />
                <FieldRow
                  label="Updated At"
                  value={new Date(profile.updatedAt).toLocaleDateString()}
                  type="text"
                />
              </Section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExaminerProfileDetail;
