// OrganizationDetail.tsx
"use client";

import React, { useState } from "react";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import RequestOrgInfoModal from "@/components/modal/RequestOrgInfoModal";
import { DashboardShell } from "@/layouts/dashboard";
import getOrganizationById from "../server/handlers/getOrganizationById";
import { cn } from "@/lib/utils";
import RejectOrgModal from "@/components/modal/RejectOrgModal";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import organizationActions from "../actions";
import { toast } from "sonner";

const mapStatus = { PENDING: "pending", ACCEPTED: "approved", REJECTED: "rejected" } as const;

type OrganizationDetailProps = {
  organization: Awaited<ReturnType<typeof getOrganizationById>>;
};

const OrganizationDetail = ({ organization }: OrganizationDetailProps) => {
  const router = useRouter();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [status, setStatus] = useState(mapStatus[organization.status as keyof typeof mapStatus]);
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "request" | null>(null);

  const type =
    organization.type?.name
      ?.split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "-";

  const handleRequestSubmit = async (messageToOrganization: string) => {
    // Check if manager email exists before proceeding
    const managerEmail = organization.manager?.[0]?.account?.user?.email;
    if (!managerEmail) {
      toast.error("Cannot send request: No manager email found.");
      return;
    }

    setLoadingAction("request");
    try {
      await organizationActions.requestMoreInfo(organization.id, messageToOrganization);
      setIsRequestOpen(false);
      toast.success("Request sent. An email has been sent to the organization.");
    } catch (error) {
      console.error("Failed to request more info:", error);
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
      toast.success("Organization approved successfully! An email has been sent to the organization.");
      router.refresh();
    } catch (error) {
      console.error("Failed to approve organization:", error);
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
      await organizationActions.rejectOrganization(organization.id, messageToOrganization);
      setIsRejectOpen(false);
      setStatus("rejected");
      toast.success("Organization rejected. An email has been sent to the organization.");
      router.refresh();
    } catch (error) {
      console.error("Failed to reject organization:", error);
      toast.error("Failed to reject organization. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <DashboardShell
      title={
        <h2 className="w-full text-left text-2xl sm:text-3xl font-bold text-black">
          {organization.name}
        </h2>
      }
    >
      <div className="w-full flex flex-col items-center min-h-[72vh]">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full flex-1 flex flex-col">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full flex-1">
            {/* Left Column - Organization Details */}
            <div className="flex flex-col gap-6 lg:gap-10">
              <Section title="Organization Details">
                <FieldRow label="Organization Name" value={organization.name} type="text" />
                <FieldRow label="Organization Type" value={type} type="text" />
                
                {/* Custom Address Lookup Field */}
                <div className="rounded-lg bg-[#F6F6F6] px-3 sm:px-4 py-2">
                  <div className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] mb-1.5 sm:mb-2">
                    Address Lookup
                  </div>
                  <div className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#000080] break-words">
                    {organization.address?.address || "-"}
                  </div>
                </div>
                
                <FieldRow label="Organization Website" value={organization.website || "-"} type="text" />
              </Section>
            </div>

            {/* Right Column - Personal Details */}
            <div className="flex flex-col gap-6 lg:gap-10">
              <Section title="Personal Details">
                <FieldRow
                  label="Full Name"
                  value={
                    organization.manager?.[0]?.account?.user
                      ? `${organization.manager?.[0]?.account?.user.firstName ?? ""} ${organization.manager?.[0]?.account?.user.lastName ?? ""}`.trim() || "-"
                      : "-"
                  }
                  type="text"
                />
                <FieldRow
                  label="Phone Number"
                  value={organization.manager?.[0]?.account?.user?.phone || "-"}
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
                  value={organization.manager?.[0]?.department?.name || "-"}
                  type="text"
                />
              </Section>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-6 sm:pt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end">
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
                  {loadingAction === "approve" ? "Approving..." : "Approve"}
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
                  {loadingAction === "reject" ? "Rejecting..." : "Reject Organization"}
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
