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


const mapStatus = { PENDING: "pending", ACCEPTED: "approved", REJECTED: "rejected" } as const;

type Props = { examiner: ExaminerData };

export default function ExaminerDetail({ examiner }: Props) {
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [status, setStatus] = useState<(typeof mapStatus)[ExaminerData["status"]]>(
        mapStatus[examiner.status]
    );
    const [isLoading, setIsLoading] = useState(false);
    const isTerminal = status === "approved" || status === "rejected";

    const formattedExpiry = examiner.licenseExpiryDate
        ? formatDateLong(examiner.licenseExpiryDate)
        : "-";

    const handleApprove = async () => {
        setIsLoading(true);
        // await api.approveExaminer({ id: examiner.id })
        setIsLoading(false);
        setStatus("approved");
    };

    const handleRejectSubmit = async () => {
        setIsRejectOpen(false);
    };

    const handleRequestMoreInfoSubmit = async (_text: string) => {
        setIsRequestOpen(false);
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
                                    value="Download"
                                    valueHref={examiner.cvUrl}
                                    type="link"
                                />
                                <FieldRow
                                    label="Medical License"
                                    value="Download"
                                    valueHref={examiner.medicalLicenseUrl}
                                    type="link"
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
                                    value="Download"
                                    valueHref={examiner.insuranceProofUrl}
                                    type="link"
                                />
                                <FieldRow
                                    label="Signed NDA"
                                    value="Download"
                                    valueHref={examiner.signedNdaUrl}
                                    type="link"
                                />
                            </Section>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end">
                        <button
                            className={cn(
                                "px-4 py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
                            disabled={isLoading || status === "rejected"}
                            onClick={handleApprove}
                        >
                            {status === "approved" ? "Approved" : isLoading ? "Approving..." : "Approve Examiner"}
                        </button>

                        <button
                            onClick={() => setIsRequestOpen(true)}
                            className={cn(
                                "px-4 py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
                            disabled={isLoading || isTerminal}
                        >
                            {status === "rejected" ? "Requested More Info" : isLoading ? "Requesting..." : "Request More Info"}
                        </button>

                        <button
                            className={cn(
                                "px-4 py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
                            disabled={isLoading || status === "approved"}
                            onClick={() => setIsRejectOpen(true)}

                        >
                            {status === "rejected" ? "Rejected" : isLoading ? "Rejecting..." : "Reject Examiner"}
                        </button>
                    </div>
                </div>

                {/* Modal */}
                <RequestInfoModal
                    open={isRequestOpen}
                    onClose={() => setIsRequestOpen(false)}
                    onSubmit={handleRequestMoreInfoSubmit}
                    title="Request More Info"
                    placeholder="Type here"
                    maxLength={200}
                />

                <RejectModal
                    open={isRejectOpen}
                    onClose={() => setIsRejectOpen(false)}
                    onSubmit={handleRejectSubmit}
                    title="Rejection Reason"
                    placeholder="Type here"
                    maxLength={200}
                />
            </div>
        </DashboardShell>
    );
}
