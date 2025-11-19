"use client";

import { useEffect, useState } from "react";
import { useReportStore } from "../state/useReportStore";
import { PrepareReportFormProps } from "../types";
import CaseOverviewSection from "./CaseOverviewSection";
import ConsentLegalSection from "./ConsentLegalSection";
import ReferralQuestionsSection from "./ReferralQuestionsSection";
import DynamicReportSection from "./DynamicReportSection";
import AddSectionButton from "./AddSectionButton";
import SignatureSubmissionSection from "./SignatureSubmissionSection";
import ReportActions from "./ReportActions";
import { reportFormSchema } from "../schemas/report.schemas";
import { toast } from "sonner";
import { printReport } from "@/utils/pdfGenerator";

export default function PrepareReportForm({
  bookingId,
  caseData,
}: PrepareReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    dynamicSections,
    setIsSaving,
    setLastSaved,
    consentFormSigned,
    latRuleAcknowledgment,
    referralQuestionsResponse,
    referralDocuments,
    examinerName,
    professionalTitle,
    dateOfReport,
    signature,
    confirmationChecked,
  } = useReportStore();

  console.log("Preparing report for booking:", bookingId);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = "");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleSaveDraft = async (showToast = true) => {
    try {
      setIsSaving(true);

      // TODO: Implement actual save to backend/Google Docs
      // For now, we're using localStorage via Zustand persist
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastSaved(new Date());

      // Only show toast for manual saves
      if (showToast) {
        toast.success("Draft saved successfully");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      if (showToast) {
        toast.error("Failed to save draft");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsSubmitting(true);

      // Validate form data
      const formData = {
        consentFormSigned,
        latRuleAcknowledgment,
        referralQuestionsResponse,
        referralDocuments,
        dynamicSections,
        examinerName,
        professionalTitle,
        dateOfReport,
        signature,
        confirmationChecked,
      };

      const validation = reportFormSchema.safeParse(formData);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error(firstError.message);
        setIsSubmitting(false);
        return;
      }

      // Save before printing
      await handleSaveDraft();

      // Generate and print PDF
      printReport(formData, caseData);

      toast.success("Report ready for printing");
    } catch (error) {
      console.error("Error preparing report for print:", error);
      toast.error("Failed to prepare report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto px-6 py-2">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
            Prepare IME Report
          </h1>
        </div>

        {/* Case Overview */}
        <CaseOverviewSection data={caseData} />

        {/* Consent & Legal */}
        <ConsentLegalSection />

        {/* Referral Questions */}
        <ReferralQuestionsSection />

        {/* Dynamic Sections */}
        {dynamicSections.map((section) => (
          <DynamicReportSection
            key={section.id}
            id={section.id}
            title={section.title}
            content={section.content}
          />
        ))}

        {/* Add Section Button */}
        <AddSectionButton />

        {/* Signature & Submission */}
        <SignatureSubmissionSection />

        {/* Action Buttons */}
        <ReportActions
          onSaveDraft={handleSaveDraft}
          onPrint={handlePrint}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
