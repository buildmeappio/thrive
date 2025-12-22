"use client";
import { useState } from "react";
import { toast } from "sonner";
import { updateComplianceAction } from "../server/actions";

interface ComplianceAgreements {
  phipaCompliance: boolean;
  pipedaCompliance: boolean;
  medicalLicenseActive: boolean;
}

interface UseComplianceSubmissionOptions {
  examinerProfileId: string | null;
  agreements: ComplianceAgreements;
  onComplete: () => void;
  onMarkComplete?: () => void;
  onDataUpdate?: (data: ComplianceAgreements) => void;
  isSettingsPage?: boolean;
}

/**
 * Hook for handling compliance form submission
 */
export function useComplianceSubmission({
  examinerProfileId,
  agreements,
  onComplete,
  onMarkComplete,
  onDataUpdate,
  isSettingsPage = false,
}: UseComplianceSubmissionOptions) {
  const [loading, setLoading] = useState(false);

  const validateAgreements = (): string | null => {
    if (
      !agreements.phipaCompliance ||
      !agreements.pipedaCompliance ||
      !agreements.medicalLicenseActive
    ) {
      return "Please acknowledge all required compliance statements";
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
      toast.error("Examiner profile ID not found");
      return;
    }

    const validationError = validateAgreements();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await updateComplianceAction({
        examinerProfileId,
        phipaCompliance: agreements.phipaCompliance,
        pipedaCompliance: agreements.pipedaCompliance,
        medicalLicenseActive: agreements.medicalLicenseActive,
      });

      if (result.success) {
        // Update parent component's data state if callback is provided (for settings page)
        if (onDataUpdate && isSettingsPage) {
          onDataUpdate(agreements);
        }
        toast.success("Compliance acknowledgments saved successfully");
        onComplete();
      } else {
        toast.error(
          result.message || "Failed to save compliance acknowledgments",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
      toast.error("Examiner profile ID not found");
      return;
    }

    const validationError = validateAgreements();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await updateComplianceAction({
        examinerProfileId,
        phipaCompliance: agreements.phipaCompliance,
        pipedaCompliance: agreements.pipedaCompliance,
        medicalLicenseActive: agreements.medicalLicenseActive,
      });

      if (result.success) {
        toast.success(
          "Compliance acknowledgments saved and marked as complete",
        );
        if (onMarkComplete) {
          onMarkComplete();
        }
        onComplete();
      } else {
        toast.error(
          result.message || "Failed to save compliance acknowledgments",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    handleMarkComplete,
    loading,
  };
}
