"use client";

import { Check } from "lucide-react";
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-black">Case Offer: </span>
            <span className="text-[#00A8FF]">{data.caseNumber}</span>
          </h1>
          {data.status === "ACCEPT" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-600 bg-green-50">
              <Check className="h-4 w-4 text-green-600" strokeWidth={3} />
              <span className="text-sm font-semibold text-green-600">
                Accepted
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
        {data.status !== "ACCEPT" && (
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
            <Button
              onClick={() => handleAction("ACCEPT")}
              disabled={isLoading}
              variant="outline"
              className="h-[48px] px-6 rounded-[20px] border-2 border-[#00A8FF] bg-white text-[#00A8FF] font-medium hover:bg-[#F0F8FF] transition-colors">
              Accept Case
            </Button>
            <Button
              onClick={() => setIsDeclineModalOpen(true)}
              disabled={isLoading || data.status === "DECLINE"}
              className="h-[48px] px-6 rounded-[20px] bg-[#DC2626] text-white font-medium hover:bg-[#B91C1C] transition-colors">
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
