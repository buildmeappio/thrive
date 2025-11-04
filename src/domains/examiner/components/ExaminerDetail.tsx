"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import RequestInfoModal from "@/components/modal/RequestInfoModal";
import RejectModal from "@/components/modal/RejectModal";
import { cn } from "@/lib/utils";
import { ExaminerData } from "../types/ExaminerData";
import { approveExaminer, rejectExaminer, requestMoreInfo } from "../actions";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords } from "@/utils/text";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Utility function to format years of experience: keep numeric ranges like "1-2", format text like "less-than-1"
const formatYearsOfExperience = (str: string): string => {
  if (!str) return str;

  // Check if it's a numeric range like "1-2", "3-5", "10-15"
  if (/^\d+-\d+$/.test(str)) {
    return str; // Keep as is
  }

  // Otherwise, format as text (replace hyphens/underscores with spaces and capitalize)
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const mapStatus = {
  PENDING: "pending",
  ACCEPTED: "approved",
  REJECTED: "rejected",
  INFO_REQUESTED: "info_requested",
} as const;

type Props = { examiner: ExaminerData };

export default function ExaminerDetail({ examiner }: Props) {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [status, setStatus] = useState<
    (typeof mapStatus)[ExaminerData["status"]]
  >(mapStatus[examiner.status]);
  const [loadingAction, setLoadingAction] = useState<
    "approve" | "reject" | "request" | null
  >(null);

  const handleApprove = async () => {
    setLoadingAction("approve");
    try {
      await approveExaminer(examiner.id);
      setStatus("approved");
      toast.success(
        "Examiner approved successfully! An email has been sent to the examiner."
      );
    } catch (error: any) {
      console.error("Failed to approve examiner:", error);
      const errorMessage =
        error?.message || "Failed to approve examiner. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectSubmit = async (
    internalNotes: string,
    messageToExaminer: string
  ) => {
    setLoadingAction("reject");
    try {
      await rejectExaminer(examiner.id, messageToExaminer);
      setStatus("rejected");
      setIsRejectOpen(false);
      toast.success(
        "Examiner rejected. An email has been sent to the examiner."
      );
    } catch (error) {
      console.error("Failed to reject examiner:", error);
      toast.error("Failed to reject examiner. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestMoreInfoSubmit = async (
    internalNotes: string,
    messageToExaminer: string,
    documentsRequired: boolean
  ) => {
    setLoadingAction("request");
    try {
      await requestMoreInfo(examiner.id, messageToExaminer, documentsRequired);
      setStatus("info_requested");
      setIsRequestOpen(false);
      toast.success("Request sent. An email has been sent to the examiner.");
    } catch (error) {
      console.error("Failed to request more info:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <DashboardShell>
      {/* Review Profile Heading */}
      <div className="mb-6">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Review{" "}
          <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
            {capitalizeWords(examiner.name)}
          </span>{" "}
          Profile
        </h1>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          <div className="flex flex-col gap-6 lg:gap-10">
            {/* First row: Organization (left) and IME Experience (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Left column - Examiner Info */}
              <Section title="What Organization Do You Represent?">
                <FieldRow
                  label="Name"
                  value={capitalizeWords(examiner.name || "-")}
                  type="text"
                />
                <FieldRow
                  label="Medical Specialties"
                  value={
                    examiner.specialties
                      ?.map((s) => formatText(s))
                      .join(", ") || "-"
                  }
                  type="text"
                />
                <FieldRow
                  label="Phone Number"
                  value={formatPhoneNumber(examiner.phone)}
                  type="text"
                />
                <FieldRow
                  label="Landline Number"
                  value={formatPhoneNumber(examiner.landlineNumber)}
                  type="text"
                />
                <FieldRow
                  label="Email Address"
                  value={examiner.email || "-"}
                  type="text"
                />
                <FieldRow
                  label="Province"
                  value={examiner.province || "-"}
                  type="text"
                />
                <FieldRow
                  label="Mailing Address"
                  value={examiner.mailingAddress || "-"}
                  type="text"
                />
              </Section>

              {/* Right column - IME Experience */}
              <Section title="IME Experience & Qualifications">
                <FieldRow
                  label="Languages Spoken"
                  value={examiner.languagesSpoken?.join(", ") || "-"}
                  type="text"
                />
                <FieldRow
                  label="Years of IME Experience"
                  value={
                    examiner.yearsOfIMEExperience
                      ? formatYearsOfExperience(examiner.yearsOfIMEExperience)
                      : "-"
                  }
                  type="text"
                />
                <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 min-h-[169px] flex flex-col">
                  <h4 className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] mb-3">
                    Share Some Details About Your Past Experience
                  </h4>
                  <p
                    className="font-poppins text-base text-[#000080] flex-1 overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: "vertical",
                      textOverflow: "ellipsis",
                    }}>
                    {examiner.experienceDetails || "-"}
                  </p>
                </div>
              </Section>
            </div>

            {/* Second row: Medical Credentials (left) and Consent + Actions (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Left column - Medical Credentials */}
              <Section title="Medical Credentials">
                <FieldRow
                  label="License Number"
                  value={examiner.licenseNumber || "-"}
                  type="text"
                />
                <FieldRow
                  label="Province of Licensure"
                  value={examiner.provinceOfLicensure || "-"}
                  type="text"
                />
                <FieldRow
                  label="CV / Resume"
                  value={examiner.cvUrl ? "CV_Resume.pdf" : "Not uploaded"}
                  type={examiner.cvUrl ? "document" : "text"}
                  documentUrl={examiner.cvUrl}
                />
                <FieldRow
                  label="Medical License"
                  value={
                    examiner.medicalLicenseUrl
                      ? "Medical_License.pdf"
                      : "Not uploaded"
                  }
                  type={examiner.medicalLicenseUrl ? "document" : "text"}
                  documentUrl={examiner.medicalLicenseUrl}
                />
              </Section>

              {/* Right column - Consent and Actions */}
              <div className="flex flex-col gap-6 lg:gap-10">
                <Section title="Consent">
                  <FieldRow
                    label="Consent to Background Verification"
                    value="Yes" // Default to Yes since this is required for examiners
                    type="text"
                  />
                </Section>

                <Section title="Actions">
                  <div className="flex flex-row flex-wrap gap-3">
                    {status === "approved" ? (
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full border border-green-500 text-green-700 bg-green-50 flex items-center gap-2 cursor-default"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 500,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled>
                        <Check className="w-4 h-4" />
                        Approved
                      </button>
                    ) : status === "rejected" ? (
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full text-white bg-red-700 flex items-center gap-2 cursor-default"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 500,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled>
                        Rejected
                      </button>
                    ) : status === "info_requested" ? (
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full border border-blue-500 text-blue-700 bg-blue-50 flex items-center gap-2 cursor-default"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 500,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Information Requested
                      </button>
                    ) : (
                      <>
                        <button
                          className={cn(
                            "px-4 py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 400,
                            lineHeight: "100%",
                            fontSize: "14px",
                          }}
                          disabled={loadingAction !== null}
                          onClick={handleApprove}>
                          {loadingAction === "approve"
                            ? "Approving..."
                            : "Approve Examiner"}
                        </button>

                        <button
                          onClick={() => setIsRequestOpen(true)}
                          className={cn(
                            "px-4 py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 400,
                            lineHeight: "100%",
                            fontSize: "14px",
                          }}
                          disabled={loadingAction !== null}>
                          {loadingAction === "request"
                            ? "Requesting..."
                            : "Request More Info"}
                        </button>

                        <button
                          className={cn(
                            "px-4 py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 400,
                            lineHeight: "100%",
                            fontSize: "14px",
                          }}
                          disabled={loadingAction !== null}
                          onClick={() => setIsRejectOpen(true)}>
                          {loadingAction === "reject"
                            ? "Rejecting..."
                            : "Reject Examiner"}
                        </button>
                      </>
                    )}
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <RequestInfoModal
          open={isRequestOpen}
          onClose={() => setIsRequestOpen(false)}
          onSubmit={handleRequestMoreInfoSubmit}
          title="Request More Info"
          maxLength={200}
        />

        <RejectModal
          open={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          onSubmit={handleRejectSubmit}
          title="Reason for Rejection"
          maxLength={200}
        />
      </div>
    </DashboardShell>
  );
}
