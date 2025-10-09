"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import RequestInfoModal from "@/components/modal/RequestInfoModal";
import RejectModal from "@/components/modal/RejectModal";
import { cn } from "@/lib/utils";
import { formatDateLong } from "@/utils/date";
import { ExaminerData } from "../types/ExaminerData";
import { approveExaminer, rejectExaminer, requestMoreInfo } from "../actions";
import { Check } from "lucide-react";
import { toast } from "sonner";


const mapStatus = { PENDING: "pending", ACCEPTED: "approved", REJECTED: "rejected" } as const;

type Props = { examiner: ExaminerData };

export default function ExaminerDetail({ examiner }: Props) {
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [status, setStatus] = useState<(typeof mapStatus)[ExaminerData["status"]]>(
        mapStatus[examiner.status]
    );
    const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "request" | null>(null);

    const formattedExpiry = examiner.licenseExpiryDate
        ? formatDateLong(examiner.licenseExpiryDate)
        : "-";

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

    const handleRequestMoreInfoSubmit = async (internalNotes: string, messageToExaminer: string) => {
        setLoadingAction("request");
        try {
            await requestMoreInfo(examiner.id, messageToExaminer);
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
        <DashboardShell
            title={
                <h2 className="w-full text-left text-2xl sm:text-3xl font-bold">
                    Review{" "}
                    <span className="bg-[linear-gradient(270deg,#01F4C8_50%,#00A8FF_65.19%)] bg-clip-text text-transparent break-words">
                        {examiner.name}
                    </span>{" "}
                    Profile
                </h2>
            }
        >
            <div className="w-full flex flex-col items-center">
                <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                        {/* Left column */}
                        <div className="flex flex-col gap-6 lg:gap-10">
                            <Section title="Personal & Contact Info">
                                <FieldRow label="Name" value={examiner.name} type="text" />
                                <FieldRow
                                    label="Medical Specialties"
                                    value={examiner.specialties?.join(", ") || "-"}
                                    type="text"
                                />
                                <FieldRow label="Phone Number" value={examiner.phone || "-"} type="text" />
                                <FieldRow label="Email" value={examiner.email || "-"} type="text" />
                                <FieldRow label="Province" value={examiner.province || "-"} type="text" />
                                <FieldRow
                                    label="Mailing Address"
                                    value={examiner.mailingAddress || "-"}
                                    type="text"
                                />
                            </Section>

                            <Section title="Medical Credentials">
                                <FieldRow label="License Number" value={examiner.licenseNumber || "-"} type="text" />
                                <FieldRow
                                    label="Province of Licensure"
                                    value={examiner.provinceOfLicensure || "-"}
                                    type="text"
                                />
                                <FieldRow
                                    label="License Expiry Date"
                                    value={formattedExpiry}
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
                        </div>

                        {/* Right column */}
                        <div className="flex flex-col gap-6 lg:gap-10">
                            <Section title="IME Experience & Qualifications">
                                <FieldRow
                                    label="Languages Spoken"
                                    value={examiner.languagesSpoken?.join(", ") || "-"}
                                    type="text"
                                />
                                <FieldRow
                                    label="Years of IME Experience"
                                    value={
                                        typeof examiner.yearsOfIMEExperience === "number"
                                            ? String(examiner.yearsOfIMEExperience)
                                            : "-"
                                    }
                                    type="text"
                                />
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex items-center justify-between w-full">
                                        <h4 className="font-degular font-semibold text-[16px] sm:text-[18px] tracking-[-0.03em] text-black">
                                            Share Some Details About Your Past Experience
                                        </h4>
                                    </div>
                                    <div className="rounded-lg bg-[#F6F6F6] px-4 py-3">
                                        <p className="font-[Poppins] text-[14px] sm:text-[16px] leading-snug text-[#000080] break-words">
                                            {examiner.experienceDetails || "-"}
                                        </p>
                                    </div>
                                </div>
                            </Section>

                            <Section title="Legal & Compliance">
                                <FieldRow
                                    label="Insurance Proof"
                                    value={examiner.insuranceProofUrl ? "Download" : "Not uploaded"}
                                    valueHref={examiner.insuranceProofUrl}
                                    type={examiner.insuranceProofUrl ? "link" : "text"}
                                />
                                <FieldRow
                                    label="Signed NDA"
                                    value={examiner.signedNdaUrl ? "Download" : "Not uploaded"}
                                    valueHref={examiner.signedNdaUrl}
                                    type={examiner.signedNdaUrl ? "link" : "text"}
                                />
                            </Section>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end">
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
