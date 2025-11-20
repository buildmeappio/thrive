"use client";

import { useRouter } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CaseDetailsProps } from "../types";
import { useCaseDetailsHandlers } from "./caseDetails/useCaseDetailsHandlers";
import ClaimantDetailsSection from "./caseDetails/ClaimantDetailsSection";
import InsuranceDetailsSection from "./caseDetails/InsuranceDetailsSection";
import LegalRepresentativeSection from "./caseDetails/LegalRepresentativeSection";
import ExaminationInfoSection from "./caseDetails/ExaminationInfoSection";
import DocumentsSection from "./caseDetails/DocumentsSection";
import DocumentPreviewModal from "./caseDetails/DocumentPreviewModal";
import DeclineModal from "./DeclineModal";

export default function CaseDetails({
  data,
  examinerProfileId,
}: CaseDetailsProps) {
  const router = useRouter();
  const {
    isLoading,
    isDeclineModalOpen,
    previewUrl,
    previewFileName,
    setIsDeclineModalOpen,
    handleAction,
    handleDecline,
    handlePreview,
    closePreview,
    handleDownload,
  } = useCaseDetailsHandlers({ data, examinerProfileId });

  return (
    <div className="min-h-screen bg-[#F0F8FF]">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center cursor-pointer justify-center w-12 h-12 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Go back">
              <ArrowLeft className="h-5 w-5 text-[#00A8FF]" />
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-black">Appointment Offer: </span>
              <span className="text-[#00A8FF]">{data.caseNumber}</span>
            </h1>
          </div>
          {data.status === "ACCEPT" && !data.reportStatus && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00A8FF] bg-[#E6F6FF]">
              <Check className="h-4 w-4 text-[#00A8FF]" strokeWidth={3} />
              <span className="text-sm font-semibold text-[#00A8FF]">
                Report Pending
              </span>
            </div>
          )}
          {data.reportStatus === "DRAFT" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#FFA500] bg-[#FFF4E6]">
              <svg
                className="h-4 w-4 text-[#FFA500]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-sm font-semibold text-[#FFA500]">
                Draft
              </span>
            </div>
          )}
          {data.reportStatus === "SUBMITTED" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#10B981] bg-[#ECFDF5]">
              <Check className="h-4 w-4 text-[#10B981]" strokeWidth={3} />
              <span className="text-sm font-semibold text-[#10B981]">
                Submitted
              </span>
            </div>
          )}
          {data.status === "PENDING" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#FFA500] bg-[#FFF4E6]">
              <svg
                className="h-4 w-4 text-[#FFA500]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-[#FFA500]">
                Pending Review
              </span>
            </div>
          )}
        </div>

        {/* Accordion Sections */}
        <div className="bg-white rounded-[29px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6 mb-6">
          <Accordion type="single" collapsible className="w-full">
            <ClaimantDetailsSection claimant={data.claimant} />

            {data.insurance && (
              <InsuranceDetailsSection insurance={data.insurance} />
            )}

            {data.legalRepresentative && (
              <LegalRepresentativeSection
                legalRepresentative={data.legalRepresentative}
              />
            )}

            <ExaminationInfoSection examination={data.examination} />

            <DocumentsSection
              documents={data.documents}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          </Accordion>
        </div>

        {/* Action Buttons */}
        {data.reportStatus === "DRAFT" ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
            <Button
              onClick={() => {
                router.push(`/appointments/${data.bookingId}/prepare-report`);
              }}
              className="h-[48px] cursor-pointer px-6 rounded-[20px] bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] text-white font-medium hover:opacity-90 transition-opacity">
              Continue Draft
            </Button>
          </div>
        ) : data.reportStatus === "SUBMITTED" ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
            <Button
              onClick={() => {
                router.push(`/appointments/${data.bookingId}/prepare-report`);
              }}
              className="h-[48px] cursor-pointer px-6 rounded-[20px] bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] text-white font-medium hover:opacity-90 transition-opacity">
              Review Report
            </Button>
          </div>
        ) : data.status === "ACCEPT" ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
            <Button
              onClick={() => {
                router.push(`/appointments/${data.bookingId}/prepare-report`);
              }}
              className="h-[48px] cursor-pointer px-6 rounded-[20px] bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] text-white font-medium hover:opacity-90 transition-opacity">
              Prepare Report
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
            <Button
              onClick={() => handleAction("ACCEPT")}
              disabled={isLoading}
              variant="outline"
              className="h-[48px] cursor-pointer px-6 rounded-[20px] border-2 border-[#00A8FF] bg-white text-[#00A8FF] font-medium hover:bg-[#F0F8FF] transition-colors">
              Accept Case
            </Button>
            <Button
              onClick={() => setIsDeclineModalOpen(true)}
              disabled={isLoading || data.status === "DECLINE"}
              className="h-[48px] cursor-pointer px-6 rounded-[20px] bg-[#DC2626] text-white font-medium hover:bg-[#B91C1C] transition-colors">
              Decline Offer
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <DeclineModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onSubmit={handleDecline}
        isLoading={isLoading}
      />

      {/* Document Preview Modal */}
      {previewUrl && (
        <DocumentPreviewModal
          previewUrl={previewUrl}
          previewFileName={previewFileName}
          onClose={closePreview}
        />
      )}
    </div>
  );
}
