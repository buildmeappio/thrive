'use client';

import React from 'react';
import { DashboardShell } from '@/layouts/dashboard';
import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { ExaminerProfileData } from '../types/ExaminerProfileData';
import { ArrowLeft } from 'lucide-react';
import { capitalizeWords, formatDocumentFilename } from '@/utils/text';
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

// Utility function to convert UTC time string (HH:mm) to user's local timezone
const convertUTCToLocalTime = (utcTimeString: string): string => {
  try {
    // Parse UTC time string (HH:mm format)
    const timeMatch = utcTimeString.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      return utcTimeString; // Return as-is if format doesn't match
    }

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    // Validate hours and minutes
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours >= 24 ||
      minutes < 0 ||
      minutes >= 60
    ) {
      return utcTimeString; // Return as-is if invalid
    }

    // Create a date object with today's date and UTC time
    const today = new Date();
    const utcDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), hours, minutes)
    );

    // Convert to local time and format
    return utcDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error converting UTC time to local:', error);
    return utcTimeString; // Return as-is on error
  }
};

// Utility function to format years of experience: keep numeric ranges and hyphens intact
const formatYearsOfExperience = (str: string): string => {
  if (!str) return str;
  const trimmed = str.trim();

  // Match patterns like "2-3", "2 - 3", "2 3", optionally with trailing text (e.g., "Years")
  const rangeMatch = trimmed.match(/^(\d+)[\s-]+(\d+)(.*)$/i);
  if (rangeMatch) {
    const [, start, end, suffix] = rangeMatch;
    const formattedSuffix = suffix ? ` ${formatText(suffix.trim().replace(/^-+/, ''))}` : '';
    return `${start}-${end}${formattedSuffix}`.trim();
  }

  // Match standalone numeric range (no suffix)
  if (/^\d+-\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Otherwise, format as text (replace hyphens/underscores with spaces and capitalize)
  return trimmed
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const dayOfWeekOrder = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const ExaminerProfileDetail: React.FC<Props> = ({ profile }) => {
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return (
    <DashboardShell>
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
                  label="Years of Experience"
                  value={
                    profile.yearsOfIMEExperience
                      ? formatYearsOfExperience(profile.yearsOfIMEExperience)
                      : '-'
                  }
                  type="text"
                />
                <FieldRow label="Clinic Name" value={profile.clinicName || '-'} type="text" />
                <FieldRow label="Clinic Address" value={profile.clinicAddress || '-'} type="text" />
                {profile.profilePhotoUrl && (
                  <FieldRow
                    label="Profile Photo"
                    value="View Photo"
                    type="document"
                    documentUrl={profile.profilePhotoUrl}
                  />
                )}
                {profile.bio && profile.bio.trim() !== '' && (
                  <div className="flex min-h-[120px] flex-col rounded-lg bg-[#F6F6F6] px-4 py-3">
                    <h4 className="mb-3 font-[Poppins] text-[14px] font-[400] leading-none tracking-[-0.03em] text-[#4E4E4E] sm:text-[16px]">
                      Bio
                    </h4>
                    <p className="font-poppins flex-1 text-base text-[#000080]">{profile.bio}</p>
                  </div>
                )}
              </Section>

              {/* Section 2: Services & Assessment Types */}
              <Section title="Services & Assessment Types">
                <FieldRow
                  label="Assessment Types"
                  value={
                    profile.assessmentTypes && profile.assessmentTypes.length > 0
                      ? profile.assessmentTypes.map(type => formatText(type)).join(', ')
                      : '-'
                  }
                  type="text"
                />
                {profile.assessmentTypeOther && (
                  <FieldRow
                    label="Other Assessment Type"
                    value={capitalizeWords(profile.assessmentTypeOther)}
                    type="text"
                  />
                )}
                <FieldRow
                  label="Accept Virtual Assessments"
                  value={profile.acceptVirtualAssessments ? 'Yes' : 'No'}
                  type="text"
                />
                <FieldRow
                  label="Accept In-Person Assessments"
                  value={profile.acceptInPersonAssessments ? 'Yes' : 'No'}
                  type="text"
                />
                <FieldRow
                  label="Travel to Claimants"
                  value={profile.travelToClaimants ? 'Yes' : 'No'}
                  type="text"
                />
                {profile.travelToClaimants && profile.maxTravelDistance && (
                  <FieldRow label="Travel Radius" value={profile.maxTravelDistance} type="text" />
                )}
              </Section>

              {/* Section 3: Availability Preferences */}
              <Section title="Availability Preferences">
                <FieldRow
                  label="Maximum IMEs per Week"
                  value={profile.maxIMEsPerWeek || '-'}
                  type="text"
                />
                <FieldRow
                  label="Minimum Notice Required"
                  value={
                    profile.minimumNoticeValue && profile.minimumNoticeUnit
                      ? `${profile.minimumNoticeValue} ${formatText(profile.minimumNoticeUnit)}`
                      : '-'
                  }
                  type="text"
                />

                {/* Weekly Hours */}
                {profile.weeklyAvailability && profile.weeklyAvailability.length > 0 && (
                  <div className="flex min-h-[120px] flex-col rounded-lg bg-[#F6F6F6] px-4 py-3">
                    <h4 className="mb-3 font-[Poppins] text-[14px] font-[400] leading-none tracking-[-0.03em] text-[#4E4E4E] sm:text-[16px]">
                      Weekly Hours
                    </h4>
                    <div className="space-y-2">
                      {profile.weeklyAvailability
                        .sort(
                          (a, b) =>
                            dayOfWeekOrder.indexOf(a.dayOfWeek) -
                            dayOfWeekOrder.indexOf(b.dayOfWeek)
                        )
                        .map(day => (
                          <div key={day.id} className="flex items-start justify-between">
                            <span className="font-poppins min-w-[100px] text-[14px] font-medium text-[#4E4E4E]">
                              {formatText(day.dayOfWeek)}:
                            </span>
                            <span className="font-poppins flex-1 text-right text-[14px] text-[#000080]">
                              {day.enabled && day.timeSlots.length > 0
                                ? day.timeSlots
                                    .map(
                                      slot =>
                                        `${convertUTCToLocalTime(slot.startTime)} - ${convertUTCToLocalTime(slot.endTime)}`
                                    )
                                    .join(', ')
                                : 'Unavailable'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
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
                <FieldRow
                  label="Account Number"
                  value={profile.accountNumber ? '****' + profile.accountNumber.slice(-4) : '-'}
                  type="text"
                />
              </Section>

              {/* Section 5: Documents Upload */}
              <Section title="Verification Documents">
                {(() => {
                  // Collect all documents into a single array
                  const allDocuments: { url: string; filename: string }[] = [];

                  // Add medical license documents
                  if (profile.medicalLicenseUrls && profile.medicalLicenseUrls.length > 0) {
                    profile.medicalLicenseUrls.forEach((url, idx) => {
                      const name =
                        profile.medicalLicenseNames?.[idx] || 'Verification_Document.pdf';
                      allDocuments.push({ url, filename: name });
                    });
                  }

                  // Add government ID
                  if (profile.governmentIdUrl) {
                    const name = profile.governmentIdName || 'Verification_Document.pdf';
                    allDocuments.push({
                      url: profile.governmentIdUrl,
                      filename: name,
                    });
                  }

                  // Add resume
                  if (profile.resumeUrl) {
                    const name = profile.resumeName || 'Verification_Document.pdf';
                    allDocuments.push({
                      url: profile.resumeUrl,
                      filename: name,
                    });
                  }

                  // Add insurance
                  if (profile.insuranceUrl) {
                    const name = profile.insuranceName || 'Verification_Document.pdf';
                    allDocuments.push({
                      url: profile.insuranceUrl,
                      filename: name,
                    });
                  }

                  // Add specialty certificates
                  if (
                    profile.specialtyCertificatesUrls &&
                    profile.specialtyCertificatesUrls.length > 0
                  ) {
                    profile.specialtyCertificatesUrls.forEach((url, idx) => {
                      const name =
                        profile.specialtyCertificatesNames?.[idx] || 'Verification_Document.pdf';
                      allDocuments.push({ url, filename: name });
                    });
                  }

                  // Display all documents or "Not uploaded" message
                  if (allDocuments.length > 0) {
                    return (
                      <div className="max-h-[300px] space-y-2 overflow-y-auto">
                        {allDocuments.map((doc, index) => {
                          const formattedFilename = formatDocumentFilename(doc.filename);
                          return (
                            <FieldRow
                              key={index}
                              label={formattedFilename}
                              value={doc.filename}
                              type="document"
                              documentUrl={doc.url}
                            />
                          );
                        })}
                      </div>
                    );
                  } else {
                    return (
                      <FieldRow label="Verification Documents" value="Not uploaded" type="text" />
                    );
                  }
                })()}
              </Section>

              {/* Section 6: Compliance */}
              <Section title="Privacy & Compliance Acknowledgments">
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
            </div>
          </div>
        </div>
      </div>
      {/* Bottom padding for mobile */}
      <div className="h-6 sm:h-0" />
    </DashboardShell>
  );
};

export default ExaminerProfileDetail;
