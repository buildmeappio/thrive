"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import RequestInfoModal from "@/components/modal/RequestInfoModal";
import RejectModal from "@/components/modal/RejectModal";
import EditFeeStructureModal from "@/components/modal/EditFeeStructureModal";
import { cn } from "@/lib/utils";
import { ExaminerData, ExaminerFeeStructure } from "../types/ExaminerData";
import {
  approveExaminer,
  rejectExaminer,
  requestMoreInfo,
  updateFeeStructure,
  sendContract,
  moveToReview,
  scheduleInterview,
  markInterviewCompleted,
  markContractSigned,
  getExaminerContract,
} from "../actions";
import { Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords } from "@/utils/text";
import { useRouter } from "next/navigation";
import Link from "next/link";
import logger from "@/utils/logger";

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

// Utility function to format years of experience: keep numeric ranges and hyphens intact
const formatYearsOfExperience = (str: string): string => {
  if (!str) return str;
  const trimmed = str.trim();

  // Match patterns like "2-3", "2 - 3", "2 3", optionally with trailing text (e.g., "Years")
  const rangeMatch = trimmed.match(/^(\d+)[\s-]+(\d+)(.*)$/i);
  if (rangeMatch) {
    const [, start, end, suffix] = rangeMatch;
    const formattedSuffix = suffix
      ? ` ${formatText(suffix.trim().replace(/^-+/, ""))}`
      : "";
    return `${start}-${end}${formattedSuffix}`.trim();
  }

  // Match standalone numeric range (no suffix)
  if (/^\d+-\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Otherwise, format as text (replace hyphens/underscores with spaces and capitalize)
  return trimmed
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const mapStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  ACCEPTED: "approved",
  REJECTED: "rejected",
  INFO_REQUESTED: "info_requested",
  ACTIVE: "active",
  SUBMITTED: "submitted",
  IN_REVIEW: "in_review",
  MORE_INFO_REQUESTED: "more_info_requested",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  INTERVIEW_COMPLETED: "interview_completed",
  CONTRACT_SENT: "contract_sent",
  CONTRACT_SIGNED: "contract_signed",
  APPROVED: "approved",
  WITHDRAWN: "withdrawn",
  SUSPENDED: "suspended",
} as const;

type Props = { examiner: ExaminerData; isApplication?: boolean };

// Helper function to wrap icon in gradient circle with overlay
const GradientIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-5 h-5 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "#00E1B8", opacity: 0.5 }}></div>
      <div className="relative z-10 text-white flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function ExaminerDetail({ examiner, isApplication = false }: Props) {
  logger.log(examiner.feeStructure)
  const router = useRouter();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isFeeStructureOpen, setIsFeeStructureOpen] = useState(false);
  const [isContractReviewOpen, setIsContractReviewOpen] = useState(false);
  const [contractHtml, setContractHtml] = useState<string | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [pendingSendContract, setPendingSendContract] = useState(false);
  const [status, setStatus] = useState<
    (typeof mapStatus)[ExaminerData["status"]]
  >(mapStatus[examiner.status]);
  const [loadingAction, setLoadingAction] = useState<
    "approve" | "reject" | "request" | "feeStructure" | "sendContract" | "moveToReview" | "scheduleInterview" | "markInterviewCompleted" | "markContractSigned" | null
  >(null);

  // Redirect if status is DRAFT - we only show from SUBMITTED onwards
  useEffect(() => {
    const currentStatus = mapStatus[examiner.status];
    if (currentStatus === "draft") {
      router.push("/examiner");
      return;
    }
  }, [examiner.status, router]);

  // Automatically move to IN_REVIEW when admin opens a SUBMITTED/PENDING application
  useEffect(() => {
    const autoMoveToReview = async () => {
      const currentStatus = mapStatus[examiner.status];
      if (currentStatus === "submitted" || currentStatus === "pending") {
        // Update UI immediately
        setStatus("in_review");
        
        // Update database in background
        try {
          await moveToReview(examiner.id);
        } catch (error) {
          logger.error("Failed to auto-move to review:", error);
          // Revert status on error
          setStatus(currentStatus);
        }
      }
    };

    autoMoveToReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - examiner.id and examiner.status are intentionally not included

  const handleApprove = async () => {
    // Fee structure check commented out - fee structure section removed
    // if (!examiner.feeStructure) {
    //   toast.error("Please add the fee structure before approving the examiner.");
    //   return;
    // }

    setLoadingAction("approve");
    try {
      await approveExaminer(examiner.id);
      if (isApplication) {
        toast.success(
          "Application approved successfully! An email has been sent to the applicant."
        );
      } else {
        toast.success(
          "Examiner approved successfully! An email has been sent to the examiner."
        );
      }
      setStatus("approved");
    } catch (error) {
      logger.error("Failed to approve:", error);
      toast.error(`Failed to approve ${isApplication ? "application" : "examiner"}. Please try again.`);
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
      if (isApplication) {
        toast.success(
          "Application rejected. An email has been sent to the applicant."
        );
      } else {
        toast.success(
          "Examiner rejected. An email has been sent to the examiner."
        );
      }
      setStatus("rejected");
      setIsRejectOpen(false);
    } catch (error) {
      logger.error("Failed to reject:", error);
      toast.error(`Failed to reject ${isApplication ? "application" : "examiner"}. Please try again.`);
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
      if (isApplication) {
        toast.success("Request sent. An email has been sent to the applicant.");
      } else {
        toast.success("Request sent. An email has been sent to the examiner.");
      }
      setStatus("more_info_requested");
      setIsRequestOpen(false);
    } catch (error) {
      logger.error("Failed to request more info:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFeeStructureSubmit = async (
    data: Omit<ExaminerFeeStructure, "id">
  ) => {
    setLoadingAction("feeStructure");
    try {
      const result = await updateFeeStructure(examiner.id, data);
      if (result.success) {
        setIsFeeStructureOpen(false);
        toast.success("Fee structure saved successfully.");
        
        // If pending send contract, send it now after fee structure is saved
        if (pendingSendContract) {
          setPendingSendContract(false);
          await handleSendContractAfterFeeStructure();
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error || "Failed to update fee structure.");
      }
    } catch (error) {
      logger.error("Failed to update fee structure:", error);
      toast.error("Failed to update fee structure. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendContractAfterFeeStructure = async () => {
    setLoadingAction("sendContract");
    try {
      const result = await sendContract(examiner.id);
      if (result.success) {
        setStatus("contract_sent");
        toast.success("Contract sent successfully to examiner's email.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to send contract.");
      }
    } catch (error) {
      logger.error("Failed to send contract:", error);
      toast.error("Failed to send contract. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Suspend/Reactivate handlers removed - skipping for now

  const handleDeclineContract = async () => {
    setLoadingAction("reject");
    try {
      await rejectExaminer(examiner.id, "Contract declined by admin");
      setStatus("rejected");
      toast.success("Contract declined and application rejected.");
      setIsContractReviewOpen(false);
      router.refresh();
    } catch (error) {
      logger.error("Failed to decline contract:", error);
      toast.error("Failed to decline contract. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendContract = async () => {
    // Check if fee structure exists
    if (!examiner.feeStructure) {
      // Open fee structure modal and set flag to send contract after
      setPendingSendContract(true);
      setIsFeeStructureOpen(true);
      toast.info("Please add the fee structure before sending contract.");
      return;
    }

    // If fee structure exists, send contract directly
    await handleSendContractAfterFeeStructure();
  };

  const handleScheduleInterview = async () => {
    setLoadingAction("scheduleInterview");
    try {
      await scheduleInterview(examiner.id);
      setStatus("interview_scheduled");
      toast.success("Interview scheduled.");
      router.refresh();
    } catch (error) {
      logger.error("Failed to schedule interview:", error);
      toast.error("Failed to schedule interview. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkInterviewCompleted = async () => {
    setLoadingAction("markInterviewCompleted");
    try {
      await markInterviewCompleted(examiner.id);
      setStatus("interview_completed");
      toast.success("Interview marked as completed.");
      router.refresh();
    } catch (error) {
      logger.error("Failed to mark interview completed:", error);
      toast.error("Failed to mark interview completed. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkContractSigned = async () => {
    setLoadingAction("markContractSigned");
    try {
      await markContractSigned(examiner.id);
      setStatus("contract_signed");
      toast.success("Contract marked as signed.");
      router.refresh();
    } catch (error) {
      logger.error("Failed to mark contract signed:", error);
      toast.error("Failed to mark contract signed. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Function to get status badge styling
  const getStatusBadge = () => {
    switch (status) {
      // Old statuses (backward compatibility)
      case "pending":
        return {
          text: "Submitted",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradientIcon>
          ),
        };
      case "info_requested":
        return {
          text: "Info Requested",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradientIcon>
          ),
        };
      case "active":
        return {
          text: "Active",
          icon: (
            <GradientIcon>
              <Check className="w-3 h-3" />
            </GradientIcon>
          ),
        };
      // New statuses
      case "submitted":
        return {
          text: "Submitted",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradientIcon>
          ),
        };
      case "in_review":
        return {
          text: "In Review",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradientIcon>
          ),
        };
      case "more_info_requested":
        return {
          text: "More Info Requested",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradientIcon>
          ),
        };
      case "interview_scheduled":
        return {
          text: "Interview Scheduled",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </GradientIcon>
          ),
        };
      case "interview_completed":
        return {
          text: "Interview Completed",
          icon: (
            <GradientIcon>
              <Check className="w-3 h-3" />
            </GradientIcon>
          ),
        };
      case "contract_sent":
        return {
          text: "Contract Sent",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </GradientIcon>
          ),
        };
      case "contract_signed":
        return {
          text: "Contract Signed",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </GradientIcon>
          ),
        };
      case "approved":
        return {
          text: "Approved",
          icon: (
            <GradientIcon>
              <Check className="w-3 h-3" />
            </GradientIcon>
          ),
        };
      case "rejected":
        return {
          text: "Rejected",
          icon: null,
        };
      case "withdrawn":
        return {
          text: "Withdrawn",
          icon: null,
        };
      case "suspended":
        return {
          text: "Suspended",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </GradientIcon>
          ),
        };
      default:
        return {
          text: "Submitted",
          icon: (
            <GradientIcon>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradientIcon>
          ),
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <DashboardShell>
      {/* Back Button and Review Profile Heading */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href="/examiner"
            className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
              Review{" "}
              <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
                {capitalizeWords(examiner.name)}
              </span>{" "}
              {isApplication ? "Application" : "Profile"}
            </h1>
          </Link>
        </div>
        <div
          className="px-[2px] py-[2px] rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] w-fit"
        >
          <div
            className="px-4 py-2 rounded-full flex items-center gap-2"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#004766",
              backgroundColor: "#E0F7F4",
            }}
          >
            {statusBadge.icon}
            <span style={{ color: "#004766" }}>{statusBadge.text}</span>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          {/* 2-Column Layout: Left (3 sections) | Right (3 sections) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Section 1: Personal Information */}
              <Section title="Personal Information">
                <FieldRow
                  label="Name"
                  value={capitalizeWords(examiner.name || "-")}
                  type="text"
                />
                <FieldRow
                  label="Email Address"
                  value={examiner.email || "-"}
                  type="text"
                />
                <FieldRow
                  label="Cell Phone"
                  value={formatPhoneNumber(examiner.phone)}
                  type="text"
                />
                <FieldRow
                  label="Work Phone"
                  value={formatPhoneNumber(examiner.landlineNumber)}
                  type="text"
                />
                <FieldRow
                  label="Province"
                  value={examiner.province || "-"}
                  type="text"
                />
                <FieldRow
                  label="City"
                  value={examiner.addressCity || "-"}
                  type="text"
                />
                <FieldRow
                  label="Languages Spoken"
                  value={examiner.languagesSpoken?.join(", ") || "-"}
                  type="text"
                />
              </Section>

              {/* Section 2: Medical Credentials */}
              <Section title="Medical Credentials">
                <FieldRow
                  label="License/Registration Number"
                  value={examiner.licenseNumber || "-"}
                  type="text"
                />
                <FieldRow
                  label="License/Registration Issuing Province"
                  value={examiner.provinceOfLicensure || "-"}
                  type="text"
                />
                <FieldRow
                  label="Specialties"
                  value={
                    examiner.specialties
                      ?.map((s) => formatText(s))
                      .join(", ") || "-"
                  }
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
              </Section>

              {/* Section 3: Verification Documents */}
              <Section title="Verification Documents">
                {examiner.medicalLicenseUrls && examiner.medicalLicenseUrls.length > 0 ? (
                  // Multiple documents - show each file with Preview/Download
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {examiner.medicalLicenseUrls.map((url, index) => (
                      <FieldRow
                        key={index}
                        label={`Document ${index + 1}`}
                        value={`Verification_Document_${index + 1}.pdf`}
                        type="document"
                        documentUrl={url}
                      />
                    ))}
                  </div>
                ) : examiner.medicalLicenseUrl ? (
                  // Single document - use FieldRow
                  <FieldRow
                    label="Document 1"
                    value="Verification_Document.pdf"
                    type="document"
                    documentUrl={examiner.medicalLicenseUrl}
                  />
                ) : (
                  // No documents uploaded - styled like other empty states
                  <FieldRow
                    label="Verification Documents"
                    value="Not uploaded"
                    type="text"
                  />
                )}
              </Section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Section 3: IME Background and Experience */}
              <Section title="IME Background and Experience">
                <FieldRow
                  label="Have you completed any IMEs?"
                  value={
                    examiner.imesCompleted 
                      ? (examiner.imesCompleted.toLowerCase() === "yes" 
                          ? "Yes" 
                          : examiner.imesCompleted.toLowerCase() === "no" 
                          ? "No" 
                          : examiner.imesCompleted.charAt(0).toUpperCase() + examiner.imesCompleted.slice(1).toLowerCase())
                      : "-"
                  }
                  type="text"
                />
                <FieldRow
                  label="Are you currently conducting IMEs?"
                  value={examiner.currentlyConductingIMEs ? "Yes" : "No"}
                  type="text"
                />
                <FieldRow
                  label="Assessment Types"
                  value={
                    examiner.assessmentTypes && examiner.assessmentTypes.length > 0
                      ? examiner.assessmentTypes.map((type) => formatText(type)).join(", ")
                      : "-"
                  }
                  type="text"
                />
                {examiner.assessmentTypeOther && examiner.assessmentTypeOther.trim() !== "" ? (
                  <FieldRow
                    label="Other Assessment Type"
                    value={examiner.assessmentTypeOther}
                    type="text"
                  />
                ) : null}
                {/* Tell us about your experience */}
                {examiner.experienceDetails && examiner.experienceDetails.trim() !== "" ? (
                  <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 min-h-[169px] flex flex-col">
                    <h4 className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] mb-3">
                      Tell us about your experience
                    </h4>
                    <p
                      className="font-poppins text-base text-[#000080] flex-1 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {examiner.experienceDetails}
                    </p>
                  </div>
                ) : (
                  <FieldRow
                    label="Tell us about your experience"
                    value="-"
                    type="text"
                  />
                )}
              </Section>

              {/* Section 4: Fee Structure (visible if fee structure exists, for both applications and examiners after interview_scheduled) */}
              {examiner.feeStructure && ["interview_scheduled", "interview_completed", "contract_sent", "contract_signed", "approved", "active"].includes(status) && (
                <Section title="Fee Structure">
                  <FieldRow
                    label="IME Fee"
                    value={`$${examiner.feeStructure.IMEFee || 0}`}
                    type="text"
                  />
                  <FieldRow
                    label="Record Review Fee"
                    value={`$${examiner.feeStructure.recordReviewFee || 0}`}
                    type="text"
                  />
                  {examiner.feeStructure.hourlyRate && (
                    <FieldRow
                      label="Hourly Rate"
                      value={`$${examiner.feeStructure.hourlyRate}`}
                      type="text"
                    />
                  )}
                  <FieldRow
                    label="Cancellation Fee"
                    value={`$${examiner.feeStructure.cancellationFee || 0}`}
                    type="text"
                  />
                </Section>
              )}

              {/* Section 5: Consent */}
              <Section title="Consent">
                <FieldRow
                  label="Consent to Background Verification"
                  value="Yes"
                  type="text"
                />
                <FieldRow
                  label="Agree to Terms & Conditions and Privacy Policy"
                  value={examiner.agreeToTerms ? "Yes" : "No"}
                  type="text"
                />
              </Section>

              {/* Section 6: Actions - Hidden when MORE_INFO_REQUESTED, INFO_REQUESTED, or ACTIVE */}
              {/* Hide actions for approved applications (they're now examiners) and active examiners */}
              {status !== "more_info_requested" && status !== "info_requested" && status !== "active" && !(isApplication && status === "approved") && (
                <Section title="Actions">
                  <div className="flex flex-row flex-wrap gap-3">
                    {/* SUBMITTED or PENDING: Auto-moved to IN_REVIEW (no button needed) */}
                    
                    {/* IN_REVIEW: Schedule Interview, Request More Info, Reject */}
                    {status === "in_review" && (
                      <>
                        <button
                          className={cn(
                            "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 400,
                            lineHeight: "100%",
                            fontSize: "14px",
                          }}
                          disabled={loadingAction !== null}
                          onClick={handleScheduleInterview}
                        >
                          {loadingAction === "scheduleInterview" ? "Scheduling..." : "Schedule Interview"}
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
                          disabled={loadingAction !== null}
                        >
                          Request More Info
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
                          onClick={() => setIsRejectOpen(true)}
                        >
                          Reject Application
                        </button>
                      </>
                    )}

                    {/* INTERVIEW_SCHEDULED: Mark Interview Completed, Reject */}
                  {status === "interview_scheduled" && (
                    <>
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 400,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled={loadingAction !== null}
                        onClick={handleMarkInterviewCompleted}
                      >
                        {loadingAction === "markInterviewCompleted" ? "Marking..." : "Interview Held"}
                      </button>
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full border border-red-500 text-red-500 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 400,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled={loadingAction !== null}
                        onClick={() => setIsRejectOpen(true)}
                      >
                        Reject Application
                      </button>
                    </>
                  )}

                  {/* INTERVIEW_COMPLETED: Send Contract, Reject */}
                  {status === "interview_completed" && (
                    <>
                      <button
                        onClick={() => {
                          // Open fee structure modal first, then send contract after saving
                          setPendingSendContract(true);
                          setIsFeeStructureOpen(true);
                        }}
                        disabled={loadingAction !== null}
                        className={cn(
                          "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 400,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                      >
                        {loadingAction === "sendContract" ? "Sending..." : "Send Contract"}
                      </button>
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full border border-red-500 text-red-500 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 400,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled={loadingAction !== null}
                        onClick={() => setIsRejectOpen(true)}
                      >
                        Reject Application
                      </button>
                    </>
                  )}

                  {/* CONTRACT_SENT: Review Signed Contract, Re-send Contract (for both applications and examiners) */}
                  {status === "contract_sent" && (
                    <>
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full flex items-center gap-2 relative",
                          examiner.contractSignedByExaminerAt
                            ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 cursor-pointer"
                            : "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 400,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled={!examiner.contractSignedByExaminerAt || loadingAction !== null}
                        onClick={async () => {
                          if (examiner.contractSignedByExaminerAt) {
                            setIsContractReviewOpen(true);
                            setLoadingContract(true);
                            try {
                              const result = await getExaminerContract(examiner.id, isApplication);
                              if (result.success && result.contractHtml) {
                                setContractHtml(result.contractHtml);
                              } else {
                                toast.error("Failed to load contract");
                              }
                            } catch (error) {
                              logger.error("Error loading contract:", error);
                              toast.error("Failed to load contract");
                            } finally {
                              setLoadingContract(false);
                            }
                          } else {
                            toast.info(isApplication ? "Applicant has not signed contract yet" : "Examiner has not signed contract yet");
                          }
                        }}
                        title={examiner.contractSignedByExaminerAt ? "Review the signed contract" : (isApplication ? "Applicant has not signed contract yet" : "Examiner has not signed contract yet")}
                      >
                        Review Signed Contract
                      </button>
                      <button
                        onClick={handleSendContract}
                        disabled={loadingAction !== null}
                        className={cn(
                          "px-4 py-3 rounded-full border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 400,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                      >
                        {loadingAction === "sendContract" ? "Re-sending..." : "Re-send Contract"}
                      </button>
                    </>
                  )}

                  {/* CONTRACT_SIGNED: Approve Application only */}
                  {status === "contract_signed" && (
                    <button
                      className={cn(
                        "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 500,
                        lineHeight: "100%",
                        fontSize: "14px",
                      }}
                      disabled={loadingAction !== null}
                      onClick={handleApprove}
                    >
                      {loadingAction === "approve" ? "Approving..." : "Approve Application"}
                    </button>
                  )}

                  {/* Suspend/Reactivate removed - skipping for now */}

                    {/* Final states (REJECTED, WITHDRAWN): Read-only */}
                    {(status === "rejected" || status === "withdrawn") && (
                      <button
                        className={cn(
                          "px-4 py-3 rounded-full flex items-center gap-2 cursor-default",
                          status === "rejected" ? "text-white bg-red-700" :
                          "border border-gray-500 text-gray-700 bg-gray-50"
                        )}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 500,
                          lineHeight: "100%",
                          fontSize: "14px",
                        }}
                        disabled
                      >
                        {status === "rejected" && "Rejected"}
                        {status === "withdrawn" && "Withdrawn"}
                      </button>
                    )}
                  </div>
                </Section>
              )}
            </div>
          </div>

            {/* Fee Structure Section - Commented Out */}
            {/* 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              <Section
                title="Fee Structure"
                actionSlot={
                  status !== "approved" ? (
                    <button
                      onClick={() => setIsFeeStructureOpen(true)}
                      disabled={loadingAction === "feeStructure"}
                      className="flex items-center gap-2 p-2 rounded-full text-cyan-600 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={
                        examiner.feeStructure
                          ? "Edit Fee Structure"
                          : "Add Fee Structure"
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  ) : null
                }
              >
                  {examiner.feeStructure ? (
                    <>
                      <FieldRow
                        label="IME Fee"
                        value={`$${examiner.feeStructure.IMEFee}`}
                        type="text"
                      />
                      <FieldRow
                        label="Report Review Fee"
                        value={`$${examiner.feeStructure.recordReviewFee}`}
                        type="text"
                      />
                      {examiner.feeStructure.hourlyRate && (
                        <FieldRow
                          label="Hourly Rate"
                          value={`$${examiner.feeStructure.hourlyRate}`}
                          type="text"
                        />
                      )}
                      <FieldRow
                        label="Cancellation Fee"
                        value={`$${examiner.feeStructure.cancellationFee}`}
                        type="text"
                      />
                    </>
                  ) : (
                    <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 min-h-[100px] flex items-center justify-center">
                      <p className="font-poppins text-[14px] text-[#7A7A7A]">
                        No fee structure added
                      </p>
                    </div>
                  )}
                </Section>
            </div>
            */}
        </div>

        {/* Modals */}
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

        {/* Suspend Modal removed - skipping for now */}

        {/* Fee Structure Modal */}
        <EditFeeStructureModal
          open={isFeeStructureOpen}
          onClose={() => {
            setIsFeeStructureOpen(false);
            setPendingSendContract(false);
          }}
          onSubmit={handleFeeStructureSubmit}
          initialData={examiner.feeStructure}
          title={
            examiner.feeStructure ? "Edit Fee Structure" : "Add Fee Structure"
          }
          isLoading={loadingAction === "feeStructure"}
        />

        {/* Contract Review Modal */}
        {isContractReviewOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsContractReviewOpen(false)}
          >
            <div
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-lg relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Review Signed Contract
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Signed by {capitalizeWords(examiner.name)} on {examiner.contractSignedByExaminerAt ? new Date(examiner.contractSignedByExaminerAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setIsContractReviewOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Contract Preview */}
              <div className="flex-1 overflow-auto p-6">
                {loadingContract ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-600 font-poppins">Loading contract...</p>
                  </div>
                ) : contractHtml ? (
                  <div 
                    className="w-full h-full bg-white rounded-lg p-6 overflow-auto"
                    dangerouslySetInnerHTML={{ __html: contractHtml }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600 font-poppins">
                      Contract preview not available
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with Actions */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsContractReviewOpen(false)}
                  className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-poppins text-sm font-medium"
                >
                  Close
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeclineContract}
                    disabled={loadingAction !== null}
                    className={cn(
                      "px-6 py-3 rounded-full border border-red-500 text-red-700 bg-white hover:bg-red-50 font-poppins text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {loadingAction === "reject" ? "Declining..." : "Decline Contract"}
                  </button>
                  <button
                    onClick={async () => {
                      await handleMarkContractSigned();
                      setIsContractReviewOpen(false);
                    }}
                    disabled={loadingAction !== null}
                    className={cn(
                      "px-6 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-poppins text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {loadingAction === "markContractSigned" ? "Confirming..." : "Confirm Contract"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}