"use client";

import logger from "@/utils/logger";

// OrganizationDetail.tsx

import React, { useState } from "react";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import RequestOrgInfoModal from "@/components/modal/RequestOrgInfoModal";
import { DashboardShell } from "@/layouts/dashboard";
import getOrganizationById from "../server/handlers/getOrganizationById";
import { cn } from "@/lib/utils";
import RejectOrgModal from "@/components/modal/RejectOrgModal";
import { Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import organizationActions from "../actions";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords } from "@/utils/text";
import Link from "next/link";

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

type OrganizationDetailProps = {
  organization: Awaited<ReturnType<typeof getOrganizationById>>;
};

const OrganizationDetail = ({ organization }: OrganizationDetailProps) => {
  const router = useRouter();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Determine the current organization status from approvedBy/rejectedBy
  const getCurrentStatus = ():
    | "pending"
    | "approved"
    | "rejected"
    | "info_requested" => {
    if (organization.approvedBy) {
      return "approved";
    }
    if (organization.rejectedBy) {
      return "rejected";
    }
    return "pending";
  };

  const [status, setStatus] = useState<
    "pending" | "approved" | "rejected" | "info_requested"
  >(getCurrentStatus());
  const [loadingAction, setLoadingAction] = useState<
    "approve" | "reject" | "request" | null
  >(null);

  const type = organization.type?.name
    ? formatText(organization.type.name)
    : "-";

  const handleRequestSubmit = async (messageToOrganization: string) => {
    // Check if manager email exists before proceeding
    const managerEmail = organization.manager?.[0]?.account?.user?.email;
    if (!managerEmail) {
      toast.error("Cannot send request: No manager email found.");
      return;
    }

    setLoadingAction("request");
    try {
      await organizationActions.requestMoreInfo(
        organization.id,
        messageToOrganization,
      );
      setIsRequestOpen(false);
      setStatus("info_requested");
      toast.success(
        "Request sent. An email has been sent to the organization.",
      );
      router.refresh();
    } catch (error) {
      logger.error("Failed to request more info:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApprove = async () => {
    // Check if manager email exists before proceeding
    const managerEmail = organization.manager?.[0]?.account?.user?.email;
    if (!managerEmail) {
      toast.error("Cannot approve organization: No manager email found.");
      return;
    }

    setLoadingAction("approve");
    try {
      await organizationActions.approveOrganization(organization.id);
      setStatus("approved");
      toast.success(
        "Organization approved successfully! An email has been sent to the organization.",
      );
      router.refresh();
    } catch (error) {
      logger.error("Failed to approve organization:", error);
      toast.error("Failed to approve organization. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectSubmit = async (messageToOrganization: string) => {
    // Check if manager email exists before proceeding
    const managerEmail = organization.manager?.[0]?.account?.user?.email;
    if (!managerEmail) {
      toast.error("Cannot reject organization: No manager email found.");
      return;
    }

    setLoadingAction("reject");
    try {
      await organizationActions.rejectOrganization(
        organization.id,
        messageToOrganization,
      );
      setIsRejectOpen(false);
      setStatus("rejected");
      toast.success(
        "Organization rejected. An email has been sent to the organization.",
      );
      router.refresh();
    } catch (error) {
      logger.error("Failed to reject organization:", error);
      toast.error("Failed to reject organization. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <DashboardShell>
      {/* Back Button and Organization Name Heading */}
      <div className="mb-6 flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <Link href="/organization" className="flex-shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </Link>
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          {capitalizeWords(organization.name)}
        </h1>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full">
            {/* Left Column - Organization Details */}
            <div className="flex flex-col gap-6 lg:gap-10">
              <Section title="Organization Details">
                <FieldRow
                  label="Organization Name"
                  value={capitalizeWords(organization.name)}
                  type="text"
                />
                <FieldRow label="Organization Type" value={type} type="text" />
                <FieldRow
                  label="Address Lookup"
                  value={organization.address?.address || "-"}
                  type="text"
                />
                <FieldRow
                  label="Organization Website"
                  value={organization.website || "-"}
                  type="text"
                />
              </Section>
            </div>

            {/* Right Column - Personal Details */}
            <div className="flex flex-col gap-6 lg:gap-10">
              <Section title="Personal Details">
                <FieldRow
                  label="Full Name"
                  value={
                    organization.manager?.[0]?.account?.user
                      ? capitalizeWords(
                          `${organization.manager?.[0]?.account?.user.firstName ?? ""} ${organization.manager?.[0]?.account?.user.lastName ?? ""}`.trim() ||
                            "-",
                        )
                      : "-"
                  }
                  type="text"
                />
                <FieldRow
                  label="Phone Number"
                  value={formatPhoneNumber(
                    organization.manager?.[0]?.account?.user?.phone,
                  )}
                  type="text"
                />
                <FieldRow
                  label="Email Address"
                  value={organization.manager?.[0]?.account?.user?.email || "-"}
                  type="text"
                />
                <FieldRow
                  label="Job Title"
                  value={organization.manager?.[0]?.jobTitle || "-"}
                  type="text"
                />
                <FieldRow
                  label="Department"
                  value={
                    organization.manager?.[0]?.department?.name
                      ? formatText(organization.manager[0].department.name)
                      : "-"
                  }
                  type="text"
                />
              </Section>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end">
            {status === "approved" ? (
              <button
                className={cn(
                  "px-4 py-3 rounded-full border border-green-500 text-green-700 bg-green-50 flex items-center gap-2 cursor-default",
                )}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  lineHeight: "100%",
                  fontSize: "14px",
                }}
                disabled
              >
                <Check className="w-4 h-4" />
                Approved
              </button>
            ) : status === "rejected" ? (
              <button
                className={cn(
                  "px-4 py-3 rounded-full text-white bg-red-700 flex items-center gap-2 cursor-default",
                )}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  lineHeight: "100%",
                  fontSize: "14px",
                }}
                disabled
              >
                Rejected
              </button>
            ) : status === "info_requested" ? (
              <button
                className={cn(
                  "px-4 py-3 rounded-full border border-blue-500 text-blue-700 bg-blue-50 flex items-center gap-2 cursor-default",
                )}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  lineHeight: "100%",
                  fontSize: "14px",
                }}
                disabled
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                More Information Required
              </button>
            ) : (
              <>
                <button
                  className={cn(
                    "px-4 py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    lineHeight: "100%",
                    fontSize: "14px",
                  }}
                  disabled={loadingAction !== null}
                  onClick={handleApprove}
                >
                  {loadingAction === "approve" ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={() => setIsRequestOpen(true)}
                  className={cn(
                    "px-4 py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    lineHeight: "100%",
                    fontSize: "14px",
                  }}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === "request"
                    ? "Requesting..."
                    : "Request More Info"}
                </button>

                <button
                  className={cn(
                    "px-4 py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed",
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
                  {loadingAction === "reject" ? "Rejecting..." : "Reject"}
                </button>
              </>
            )}
          </div>
        </div>

        <RequestOrgInfoModal
          open={isRequestOpen}
          onClose={() => setIsRequestOpen(false)}
          onSubmit={handleRequestSubmit}
          title="Request More Info"
          maxLength={200}
        />

        <RejectOrgModal
          open={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          onSubmit={handleRejectSubmit}
          title="Reason for Rejection"
          maxLength={200}
        />
      </div>
    </DashboardShell>
  );
};

export default OrganizationDetail;
