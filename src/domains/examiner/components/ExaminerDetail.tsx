"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import RequestInfoModal from "@/components/modal/RequestInfoModal";
import RejectModal from "@/components/modal/RejectModal";
import EditFeeStructureModal from "@/components/modal/EditFeeStructureModal";
import { cn } from "@/lib/utils";
import { ExaminerData, ExaminerFeeStructure } from "../types/ExaminerData";
import { approveExaminer, rejectExaminer, requestMoreInfo, updateFeeStructure, sendContract } from "../actions";
import { Check, Pencil, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords } from "@/utils/text";
import { useRouter } from "next/navigation";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ')  // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0)  // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};


const mapStatus = { PENDING: "pending", ACCEPTED: "approved", REJECTED: "rejected", INFO_REQUESTED: "info_requested" } as const;

type Props = { examiner: ExaminerData };

export default function ExaminerDetail({ examiner }: Props) {
    const router = useRouter();
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isFeeStructureOpen, setIsFeeStructureOpen] = useState(false);
    const [status, setStatus] = useState<(typeof mapStatus)[ExaminerData["status"]]>(
        mapStatus[examiner.status]
    );
    const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "request" | "feeStructure" | "sendContract" | null>(null);

    const handleApprove = async () => {
        setLoadingAction("approve");
        try {
            await approveExaminer(examiner.id);
            setStatus("approved");
            toast.success("Examiner approved successfully! An email has been sent to the examiner.");
        } catch (error) {
            console.error("Failed to approve examiner:", error);
            toast.error("Failed to approve examiner. Please try again.");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleRejectSubmit = async (internalNotes: string, messageToExaminer: string) => {
        setLoadingAction("reject");
        try {
            await rejectExaminer(examiner.id, messageToExaminer);
            setStatus("rejected");
            setIsRejectOpen(false);
            toast.success("Examiner rejected. An email has been sent to the examiner.");
        } catch (error) {
            console.error("Failed to reject examiner:", error);
            toast.error("Failed to reject examiner. Please try again.");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleRequestMoreInfoSubmit = async (internalNotes: string, messageToExaminer: string, documentsRequired: boolean) => {
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

    const handleFeeStructureSubmit = async (data: Omit<ExaminerFeeStructure, "id">) => {
        setLoadingAction("feeStructure");
        try {
            const result = await updateFeeStructure(examiner.id, data);
            if (result.success) {
                setIsFeeStructureOpen(false);
                toast.success("Fee structure updated successfully.");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update fee structure.");
            }
        } catch (error) {
            console.error("Failed to update fee structure:", error);
            toast.error("Failed to update fee structure. Please try again.");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleSendContract = async () => {
        setLoadingAction("sendContract");
        try {
            const result = await sendContract(examiner.id);
            if (result.success) {
                toast.success("Contract sent successfully to examiner's email.");
            } else {
                toast.error(result.error || "Failed to send contract.");
            }
        } catch (error) {
            console.error("Failed to send contract:", error);
            toast.error("Failed to send contract. Please try again.");
        } finally {
            setLoadingAction(null);
        }
    };

    // Function to get status badge styling
    const getStatusBadge = () => {
        switch (status) {
            case "approved":
                return {
                    text: "Approved",
                    className: "border-green-500 text-green-700 bg-green-50",
                    icon: <Check className="w-4 h-4" />
                };
            case "rejected":
                return {
                    text: "Rejected",
                    className: "border-red-500 text-red-700 bg-red-50",
                    icon: null
                };
            case "info_requested":
                return {
                    text: "Info Requested",
                    className: "border-blue-500 text-blue-700 bg-blue-50",
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
            case "pending":
            default:
                return {
                    text: "Pending Review",
                    className: "border-yellow-500 text-yellow-700 bg-yellow-50",
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    const statusBadge = getStatusBadge();

    return (
        <DashboardShell>
            {/* Review Profile Heading */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
                    Review{" "}
                    <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
                        {capitalizeWords(examiner.name)}
                    </span>{" "}
                    Profile
                </h1>
                <div className={cn(
                    "px-4 py-2 rounded-full border-2 flex items-center gap-2 w-fit",
                    statusBadge.className
                )}
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "14px" }}
                >
                    {statusBadge.icon}
                    {statusBadge.text}
                </div>
            </div>

            <div className="w-full flex flex-col items-center">
                <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
                    <div className="flex flex-col gap-6 lg:gap-10">
                        {/* First row: Organization (left) and IME Experience (right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                            {/* Left column - Examiner Info */}
                        <Section title="What Organization Do You Represent?">
                                <FieldRow label="Name" value={capitalizeWords(examiner.name || "-")} type="text" />
                                <FieldRow label="Medical Specialties" value={examiner.specialties?.map(s => formatText(s)).join(", ") || "-"} type="text" />
                            <FieldRow label="Phone Number" value={formatPhoneNumber(examiner.phone)} type="text" />
                            <FieldRow label="Landline Number" value={formatPhoneNumber(examiner.landlineNumber)} type="text" />
                            <FieldRow label="Email Address" value={examiner.email || "-"} type="text" />
                                <FieldRow label="Province" value={examiner.province || "-"} type="text" />
                                <FieldRow label="Mailing Address" value={examiner.mailingAddress || "-"} type="text" />
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
                                    value={examiner.yearsOfIMEExperience ? formatYearsOfExperience(examiner.yearsOfIMEExperience) : "-"}
                                    type="text"
                                />
                                <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 min-h-[169px] flex flex-col">
                                    <h4 className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] mb-3">
                                        Share Some Details About Your Past Experience
                                    </h4>
                                    <p className="font-poppins text-base text-[#000080] flex-1 overflow-hidden" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 6,
                                        WebkitBoxOrient: 'vertical',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {examiner.experienceDetails || "-"}
                                    </p>
                                </div>
                            </Section>
                        </div>

                        {/* Second row: Fee Structure (left) and Medical Credentials (right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                            {/* Left column - Fee Structure */}
                            <div className="relative">
                                <Section title="Fee Structure">
                                    {examiner.feeStructure ? (
                                        <>
                                            <FieldRow
                                                label="Standard IME Fee"
                                                value={`$${examiner.feeStructure.standardIMEFee.toFixed(2)}`}
                                                type="text"
                                            />
                                            <FieldRow
                                                label="Virtual IME Fee"
                                                value={`$${examiner.feeStructure.virtualIMEFee.toFixed(2)}`}
                                                type="text"
                                            />
                                            <FieldRow
                                                label="Record Review Fee"
                                                value={`$${examiner.feeStructure.recordReviewFee.toFixed(2)}`}
                                                type="text"
                                            />
                                            {examiner.feeStructure.hourlyRate && (
                                                <FieldRow
                                                    label="Hourly Rate"
                                                    value={`$${examiner.feeStructure.hourlyRate.toFixed(2)}`}
                                                    type="text"
                                                />
                                            )}
                                            {examiner.feeStructure.reportTurnaroundDays && (
                                                <FieldRow
                                                    label="Report Turnaround Days"
                                                    value={`${examiner.feeStructure.reportTurnaroundDays} ${examiner.feeStructure.reportTurnaroundDays === 1 ? 'day' : 'days'}`}
                                                    type="text"
                                                />
                                            )}
                                            <FieldRow
                                                label="Cancellation Fee"
                                                value={`$${examiner.feeStructure.cancellationFee.toFixed(2)}`}
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
                                <button
                                    onClick={() => setIsFeeStructureOpen(true)}
                                    disabled={loadingAction === "feeStructure"}
                                    className="absolute top-3 right-3 flex items-center gap-2 p-2 rounded-full text-cyan-600 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title={examiner.feeStructure ? "Edit Fee Structure" : "Add Fee Structure"}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Right column - Medical Credentials */}
                            <Section title="Medical Credentials">
                                <FieldRow label="License Number" value={examiner.licenseNumber || "-"} type="text" />
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
                                    value={examiner.medicalLicenseUrl ? "Medical_License.pdf" : "Not uploaded"}
                                    type={examiner.medicalLicenseUrl ? "document" : "text"}
                                    documentUrl={examiner.medicalLicenseUrl}
                                />
                            </Section>
                        </div>

                        {/* Third row: Consent (left) and Actions (right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                            {/* Left column - Consent */}
                            <Section title="Consent">
                                <FieldRow
                                    label="Consent to Background Verification"
                                    value="Yes" // Default to Yes since this is required for examiners
                                    type="text"
                                />
                            </Section>

                            {/* Right column - Actions */}
                            <Section title="Actions">
                                <div className="flex flex-row flex-wrap gap-3">
                                        {status === "approved" ? (
                                            <button
                                                className={cn(
                                                    "px-4 py-3 rounded-full border border-green-500 text-green-700 bg-green-50 flex items-center gap-2 cursor-default"
                                                )}
                                                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, lineHeight: "100%", fontSize: "14px" }}
                                                disabled
                                            >
                                                <Check className="w-4 h-4" />
                                                Approved
                                            </button>
                                        ) : status === "rejected" ? (
                                            <button
                                                className={cn(
                                                    "px-4 py-3 rounded-full text-white bg-red-700 flex items-center gap-2 cursor-default"
                                                )}
                                                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, lineHeight: "100%", fontSize: "14px" }}
                                                disabled
                                            >
                                                Rejected
                                            </button>
                                        ) : status === "info_requested" ? (
                                            <button
                                                className={cn(
                                                    "px-4 py-3 rounded-full border border-blue-500 text-blue-700 bg-blue-50 flex items-center gap-2 cursor-default"
                                                )}
                                                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, lineHeight: "100%", fontSize: "14px" }}
                                                disabled
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Information Requested
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className={cn(
                                                        "px-4 py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
                                                    disabled={loadingAction !== null}
                                                    onClick={handleApprove}
                                                >
                                                    {loadingAction === "approve" ? "Approving..." : "Approve Examiner"}
                                                </button>

                                                <button
                                                    onClick={() => setIsRequestOpen(true)}
                                                    className={cn(
                                                        "px-4 py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
                                                    disabled={loadingAction !== null}
                                                >
                                                    {loadingAction === "request" ? "Requesting..." : "Request More Info"}
                                                </button>

                                                <button
                                                    className={cn(
                                                        "px-4 py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
                                                    disabled={loadingAction !== null}
                                                    onClick={() => setIsRejectOpen(true)}

                                                >
                                                    {loadingAction === "reject" ? "Rejecting..." : "Reject Examiner"}
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* Send Contract button - available for all statuses */}
                                            <button
                                                onClick={handleSendContract}
                                                disabled={!examiner.feeStructure || loadingAction !== null}
                                                className={cn(
                                                    "px-4 py-3 rounded-full border border-purple-600 text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                )}
                                                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
                                                title={!examiner.feeStructure ? "Add fee structure before sending contract" : "Send contract for review to examiner"}
                                            >
                                                <FileText className="w-4 h-4" />
                                                {loadingAction === "sendContract" ? "Sending..." : "Send Contract for Review"}
                                            </button>
                                </div>
                            </Section>
                        </div>
                    </div>
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

                <EditFeeStructureModal
                    open={isFeeStructureOpen}
                    onClose={() => setIsFeeStructureOpen(false)}
                    onSubmit={handleFeeStructureSubmit}
                    initialData={examiner.feeStructure}
                    title={examiner.feeStructure ? "Edit Fee Structure" : "Add Fee Structure"}
                    isLoading={loadingAction === "feeStructure"}
                />
            </div>
        </DashboardShell>
    );
}
