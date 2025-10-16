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
        <h2 className="w-full text-left text-2xl sm:text-3xl font-bold">
          Review{" "}
          <span className="bg-[linear-gradient(270deg,#01F4C8_50%,#00A8FF_65.19%)] bg-clip-text text-transparent break-words">
            {organization.name}
          </span>{" "}
          Profile
        </h2>
      }
    >
      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          {/* Two-column on lg, single column below */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full">
            <div className="flex flex-col gap-6 lg:gap-10">
              <Section title="Organization Info">
                <FieldRow label="Name" value={organization.name} type="text" />
                <FieldRow label="Type" value={type} type="text" />
                <FieldRow label="Website" value={organization.website || "-"} type="text" />
              </Section>

              <Section title="Manager Info">
                <FieldRow
                  label="Name"
                  value={
                    organization.manager?.[0]?.account?.user
                      ? `${organization.manager?.[0]?.account?.user.firstName ?? ""} ${organization.manager?.[0]?.account?.user.lastName ?? ""}`.trim() || "-"
                      : "-"
                  }
                  type="text"
                />
                <FieldRow
                  label="Email"
                  value={organization.manager?.[0]?.account?.user?.email || "-"}
                  type="text"
                />
                <FieldRow
                  label="Phone"
                  value={organization.manager?.[0]?.account?.user?.phone || "-"}
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

            <div className="flex flex-col gap-6 lg:gap-8">
              <Section title="Address">
                <FieldRow label="Address" value={organization.address?.address || "-"} type="text" />
                <FieldRow label="Province" value={organization.address?.province || "-"} type="text" />
                <FieldRow label="City" value={organization.address?.city || "-"} type="text" />
                <FieldRow label="Postal Code" value={organization.address?.postalCode || "-"} type="text" />
                <FieldRow label="Suite" value={organization.address?.suite || "-"} type="text" />
                <FieldRow label="Street" value={organization.address?.street || "-"} type="text" />
              </Section>

              <Section title="Legal & Compliance">
                <FieldRow
                  label="Data Sharing Consent"
                  value={organization.dataSharingConsent === true ? "Yes" : "No"}
                  type="text"
                />
                <FieldRow
                  label="Agree to Terms and Privacy"
                  value={organization.agreeToTermsAndPrivacy === true ? "Yes" : "No"}
                  type="text"
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
                  {loadingAction === "approve" ? "Approving..." : "Approve Organization"}
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
