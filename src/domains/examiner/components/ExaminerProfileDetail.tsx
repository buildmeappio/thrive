"use client";

import React from "react";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { ExaminerProfileData } from "../types/ExaminerProfileData";
import { ArrowLeft } from "lucide-react";
import { capitalizeWords } from "@/utils/text";
import Link from "next/link";

type Props = { profile: ExaminerProfileData };

const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const dayOfWeekOrder = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const ExaminerProfileDetail: React.FC<Props> = ({ profile }) => {
  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  return (
    <DashboardShell>
      {/* Back Button and Profile Heading */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href="/examiner"
            className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
              Examiner{" "}
              <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
                {capitalizeWords(fullName || profile.email)}
              </span>{" "}
              Profile
            </h1>
          </Link>
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Section 1: Profile Info */}
              <Section title="Professional Profile">
                <FieldRow
                  label="First Name"
                  value={profile.firstName || "-"}
                  type="text"
                />
                <FieldRow
                  label="Last Name"
                  value={profile.lastName || "-"}
                  type="text"
                />
                <FieldRow
                  label="Email Address"
                  value={profile.email}
                  type="text"
                />
                <FieldRow
                  label="Professional Title"
                  value={profile.professionalTitle || "-"}
                  type="text"
                />
                <FieldRow
                  label="Years of Experience"
                  value={formatText(profile.yearsOfIMEExperience)}
                  type="text"
                />
                <FieldRow
                  label="Clinic Name"
                  value={profile.clinicName || "-"}
                  type="text"
                />
                <FieldRow
                  label="Clinic Address"
                  value={profile.clinicAddress || "-"}
                  type="text"
                />
                {profile.profilePhotoUrl && (
                  <FieldRow
                    label="Profile Photo"
                    value="View Photo"
                    type="document"
                    documentUrl={profile.profilePhotoUrl}
                  />
                )}
                {profile.bio && profile.bio.trim() !== "" && (
                  <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 min-h-[120px] flex flex-col">
                    <h4 className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] mb-3">
                      Bio
                    </h4>
                    <p className="font-poppins text-base text-[#000080] flex-1">
                      {profile.bio}
                    </p>
                  </div>
                )}
              </Section>

              {/* Section 2: Services & Assessment Types */}
              <Section title="Services & Assessment Types">
                <FieldRow
                  label="Assessment Types"
                  value={
                    profile.assessmentTypes &&
                    profile.assessmentTypes.length > 0
                      ? profile.assessmentTypes
                          .map((type) => formatText(type))
                          .join(", ")
                      : "-"
                  }
                  type="text"
                />
                {profile.assessmentTypeOther && (
                  <FieldRow
                    label="Other Assessment Type"
                    value={profile.assessmentTypeOther}
                    type="text"
                  />
                )}
                <FieldRow
                  label="Accept Virtual Assessments"
                  value={profile.acceptVirtualAssessments ? "Yes" : "No"}
                  type="text"
                />
                <FieldRow
                  label="Accept In-Person Assessments"
                  value={profile.acceptInPersonAssessments ? "Yes" : "No"}
                  type="text"
                />
                <FieldRow
                  label="Travel to Claimants"
                  value={profile.travelToClaimants ? "Yes" : "No"}
                  type="text"
                />
                {profile.travelToClaimants && profile.maxTravelDistance && (
                  <FieldRow
                    label="Travel Radius"
                    value={profile.maxTravelDistance}
                    type="text"
                  />
                )}
              </Section>

              {/* Section 3: Availability Preferences */}
              <Section title="Availability Preferences">
                <FieldRow
                  label="Maximum IMEs per Week"
                  value={profile.maxIMEsPerWeek || "-"}
                  type="text"
                />
                <FieldRow
                  label="Minimum Notice Required"
                  value={
                    profile.minimumNoticeValue && profile.minimumNoticeUnit
                      ? `${profile.minimumNoticeValue} ${formatText(profile.minimumNoticeUnit)}`
                      : "-"
                  }
                  type="text"
                />

                {/* Weekly Hours */}
                {profile.weeklyAvailability &&
                  profile.weeklyAvailability.length > 0 && (
                    <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 min-h-[120px] flex flex-col">
                      <h4 className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] mb-3">
                        Weekly Hours
                      </h4>
                      <div className="space-y-2">
                        {profile.weeklyAvailability
                          .sort(
                            (a, b) =>
                              dayOfWeekOrder.indexOf(a.dayOfWeek) -
                              dayOfWeekOrder.indexOf(b.dayOfWeek),
                          )
                          .map((day) => (
                            <div
                              key={day.id}
                              className="flex justify-between items-start"
                            >
                              <span className="font-poppins text-[14px] text-[#4E4E4E] font-medium min-w-[100px]">
                                {formatText(day.dayOfWeek)}:
                              </span>
                              <span className="font-poppins text-[14px] text-[#000080] text-right flex-1">
                                {day.enabled && day.timeSlots.length > 0
                                  ? day.timeSlots
                                      .map(
                                        (slot) =>
                                          `${slot.startTime} - ${slot.endTime}`,
                                      )
                                      .join(", ")
                                  : "Unavailable"}
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
                  value={profile.institutionNumber || "-"}
                  type="text"
                />
                <FieldRow
                  label="Transit Number"
                  value={profile.transitNumber || "-"}
                  type="text"
                />
                <FieldRow
                  label="Account Number"
                  value={
                    profile.accountNumber
                      ? "****" + profile.accountNumber.slice(-4)
                      : "-"
                  }
                  type="text"
                />
              </Section>

              {/* Section 5: Documents Upload */}
              <Section title="Verification Documents">
                {(() => {
                  // Collect all documents into a single array
                  const allDocuments: { url: string; filename: string }[] = [];

                  // Add medical license documents
                  if (
                    profile.medicalLicenseUrls &&
                    profile.medicalLicenseUrls.length > 0
                  ) {
                    profile.medicalLicenseUrls.forEach((url, idx) => {
                      const name =
                        profile.medicalLicenseNames?.[idx] ||
                        "Verification_Document.pdf";
                      allDocuments.push({ url, filename: name });
                    });
                  }

                  // Add government ID
                  if (profile.governmentIdUrl) {
                    const name =
                      profile.governmentIdName || "Verification_Document.pdf";
                    allDocuments.push({
                      url: profile.governmentIdUrl,
                      filename: name,
                    });
                  }

                  // Add resume
                  if (profile.resumeUrl) {
                    const name =
                      profile.resumeName || "Verification_Document.pdf";
                    allDocuments.push({
                      url: profile.resumeUrl,
                      filename: name,
                    });
                  }

                  // Add insurance
                  if (profile.insuranceUrl) {
                    const name =
                      profile.insuranceName || "Verification_Document.pdf";
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
                        profile.specialtyCertificatesNames?.[idx] ||
                        "Verification_Document.pdf";
                      allDocuments.push({ url, filename: name });
                    });
                  }

                  // Display all documents or "Not uploaded" message
                  if (allDocuments.length > 0) {
                    return (
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {allDocuments.map((doc, index) => (
                          <FieldRow
                            key={index}
                            label={doc.filename}
                            value={doc.filename}
                            type="document"
                            documentUrl={doc.url}
                          />
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <FieldRow
                        label="Verification Documents"
                        value="Not uploaded"
                        type="text"
                      />
                    );
                  }
                })()}
              </Section>

              {/* Section 6: Compliance */}
              <Section title="Privacy & Compliance Acknowledgments">
                <FieldRow
                  label="PHIPA Compliance"
                  value={profile.phipaCompliance ? "Yes" : "No"}
                  type="text"
                />
                <FieldRow
                  label="PIPEDA Compliance"
                  value={profile.pipedaCompliance ? "Yes" : "No"}
                  type="text"
                />
                <FieldRow
                  label="Medical License Active"
                  value={profile.medicalLicenseActive ? "Yes" : "No"}
                  type="text"
                />
              </Section>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ExaminerProfileDetail;
