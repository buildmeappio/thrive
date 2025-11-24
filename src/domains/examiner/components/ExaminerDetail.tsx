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


const mapStatus = { PENDING: "pending", ACCEPTED: "approved", REJECTED: "rejected", INFO_REQUESTED: "info_requested", ACTIVE: "active" } as const;

type Props = { examiner: ExaminerData };

export default function ExaminerDetail({ examiner }: Props) {
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [status, setStatus] = useState<(typeof mapStatus)[ExaminerData["status"]]>(
        mapStatus[examiner.status]
    );
    const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "request" | null>(null);

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

    return (
        <DashboardShell>
            <div className="w-full flex flex-col items-center">
                <h2 className="w-full text-left text-2xl sm:text-3xl font-bold mb-6">
                    Review{" "}
                    <span className="bg-[linear-gradient(270deg,#01F4C8_50%,#00A8FF_65.19%)] bg-clip-text text-transparent break-words">
                        {examiner.name}
                    </span>{" "}
                    Profile
                </h2>
                <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
                    <div className="flex flex-col gap-6 lg:gap-10">
                        {/* First row: Organization (left) and IME Experience (right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                            {/* Left column - Examiner Info */}
                        <Section title="What Organization Do You Represent?">
                                <FieldRow label="Name" value={examiner.name || "-"} type="text" />
                                <FieldRow label="Medical Specialties" value={examiner.specialties?.join(", ") || "-"} type="text" />
                            <FieldRow label="Phone Number" value={examiner.phone || "-"} type="text" />
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
                                    value={examiner.yearsOfIMEExperience || "-"}
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

                        {/* Second row: Medical Credentials (left) and Consent + Actions (right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                            {/* Left column - Medical Credentials */}
                            <Section title="Medical Credentials">
                                <FieldRow label="License Number" value={examiner.licenseNumber || "-"} type="text" />
                                <FieldRow
                                    label="Province of Licensure"
                                    value={examiner.provinceOfLicensure || "-"}
                                    type="text"
                                />
                                <FieldRow
                                    label="CV / Resume"
                                    value={examiner.cvUrl ? "Download" : "Not uploaded"}
                                    valueHref={examiner.cvUrl}
                                    type={examiner.cvUrl ? "link" : "text"}
                                />
                                <FieldRow
                                    label="Medical License"
                                    value={examiner.medicalLicenseUrl ? "Download" : "Not uploaded"}
                                    valueHref={examiner.medicalLicenseUrl}
                                    type={examiner.medicalLicenseUrl ? "link" : "text"}
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
