// OrganizationDetail.tsx
"use client";

import React, { useState } from "react";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import RequestInfoModal from "@/components/modal/RequestInfoModal";
import { DashboardShell } from "@/layouts/dashboard";
import getOrganizationById from "../server/handlers/getOrganizationById";
import { cn } from "@/lib/utils";

const mapStatus = { PENDING: "pending", ACCEPTED: "approved", REJECTED: "rejected" } as const;

type OrganizationDetailProps = {
  organization: Awaited<ReturnType<typeof getOrganizationById>>;
};

const OrganizationDetail = ({ organization }: OrganizationDetailProps) => {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [status, setStatus] = useState(mapStatus[organization.status as keyof typeof mapStatus]);
  const [isLoading, setIsLoading] = useState(false);

  const type =
    organization.type?.name
      ?.split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "-";

  const handleRequestSubmit = async (_text: string) => {
    setIsRequestOpen(false);
  };

  const handleApproveExaminer = async () => {
    setIsLoading(true);
    setIsLoading(false);
    setStatus("approved");
  };

  const handleRejectExaminer = async () => {
    setIsLoading(true);
    setIsLoading(false);
    setStatus("rejected");
  };

  const isTerminal = status === "approved" || status === "rejected";

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

          {/* Actions: wrap on small screens */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end">
            <button
              className={cn(
                "px-4 py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "14px" }}
              disabled={isLoading || status === "rejected"}
              onClick={handleApproveExaminer}
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
              onClick={handleRejectExaminer}
            >
              {status === "rejected" ? "Rejected" : isLoading ? "Rejecting..." : "Reject Examiner"}
            </button>
          </div>
        </div>

        <RequestInfoModal
          open={isRequestOpen}
          onClose={() => setIsRequestOpen(false)}
          onSubmit={handleRequestSubmit}
          title="Request More Info"
          placeholder="Type here"
          maxLength={200}
        />
      </div>
    </DashboardShell>
  );
};

export default OrganizationDetail;
