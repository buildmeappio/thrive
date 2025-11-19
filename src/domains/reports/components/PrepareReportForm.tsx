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
import {
  getReportAction,
  saveReportDraftAction,
  submitReportAction,
} from "../server/actions";

export default function PrepareReportForm({
  bookingId,
  caseData,
}: PrepareReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    updateField,
    loadReport,
  } = useReportStore();

  // Load existing report on mount and pre-fill examiner info
  useEffect(() => {
    const loadExistingReport = async () => {
      try {
        setIsLoading(true);
        
        const currentDate = new Date().toISOString().split("T")[0];

        // Load existing report data
        const result = await getReportAction({ bookingId });
        
        if (result.success && result.data) {
          // Load existing report which will overwrite defaults
          loadReport(result.data);
        } else {
          // No existing report - set defaults
          if (caseData.examinerName) {
            updateField("examinerName", caseData.examinerName);
          }
          if (caseData.professionalTitle) {
            updateField("professionalTitle", caseData.professionalTitle);
          }
          updateField("dateOfReport", currentDate);
        }
      } catch (error) {
        console.error("Error loading report:", error);
        // Set defaults on error
        const errorCurrentDate = new Date().toISOString().split("T")[0];
        if (caseData.examinerName) {
          updateField("examinerName", caseData.examinerName);
        }
        if (caseData.professionalTitle) {
          updateField("professionalTitle", caseData.professionalTitle);
        }
        updateField("dateOfReport", errorCurrentDate);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

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

      // Get current form data
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

      // Save to backend
      const result = await saveReportDraftAction({
        bookingId,
        reportData: formData,
      });

      if (result.success) {
        setLastSaved(new Date());
        if (showToast) {
          toast.success("Draft saved successfully");
        }
      } else {
        throw new Error(result.message || "Failed to save draft");
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      if (showToast) {
        toast.error(error.message || "Failed to save draft");
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
      await handleSaveDraft(false);

      // Submit report
      const submitResult = await submitReportAction({
        bookingId,
        reportData: formData,
      });

      if (!submitResult.success) {
        toast.error(submitResult.message || "Failed to submit report");
        setIsSubmitting(false);
        return;
      }

      // Generate and print PDF
      printReport(formData, caseData);

      toast.success("Report submitted and ready for printing");
    } catch (error: any) {
      console.error("Error preparing report for print:", error);
      toast.error(error.message || "Failed to prepare report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

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
