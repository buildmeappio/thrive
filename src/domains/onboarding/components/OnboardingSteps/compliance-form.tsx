"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { updateComplianceAction } from "../../server/actions";
import type { ComplianceFormProps } from "../../types";

const ComplianceForm: React.FC<ComplianceFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  // Use initial data directly
  const initialAgreements = useMemo(() => {
    return {
      phipaCompliance: initialData?.phipaCompliance ?? false,
      pipedaCompliance: initialData?.pipedaCompliance ?? false,
      medicalLicenseActive: initialData?.medicalLicenseActive ?? false,
    };
  }, [initialData]);

  const [agreements, setAgreements] = useState(initialAgreements);

  // Reset agreements when initialData changes
  useEffect(() => {
    setAgreements(initialAgreements);
  }, [initialAgreements]);

  // If agreements change and step is completed, mark as incomplete
  useEffect(() => {
    if (isCompleted && onStepEdited) {
      const currentHash = JSON.stringify(agreements);
      const initialHash = JSON.stringify(initialAgreements);
      if (currentHash !== initialHash) {
        onStepEdited();
      }
    }
  }, [agreements, isCompleted, onStepEdited, initialAgreements]);

  // Check if all required checkboxes are checked
  const isFormValid = useMemo(() => {
    return (
      agreements.phipaCompliance &&
      agreements.pipedaCompliance &&
      agreements.medicalLicenseActive
    );
  }, [agreements]);

  const handleSubmit = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Validate all checkboxes are checked
    if (
      !agreements.phipaCompliance ||
      !agreements.pipedaCompliance ||
      !agreements.medicalLicenseActive
    ) {
      toast.error("Please acknowledge all required compliance statements");
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

  // Handle "Mark as Complete" - saves and marks step as complete
  const handleMarkComplete = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Validate all checkboxes are checked
    if (
      !agreements.phipaCompliance ||
      !agreements.pipedaCompliance ||
      !agreements.medicalLicenseActive
    ) {
      toast.error("Please acknowledge all required compliance statements");
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
        // Mark step as complete
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            Privacy & Compliance Acknowledgments
          </h2>
        </div>
        {/* Mark as Complete Button - Top Right */}
        {!isCompleted && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !isFormValid}
          >
            <CircleCheck className="w-5 h-5 text-gray-700" />
            <span>Mark as Complete</span>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
          <div className="space-y-6">
            {/* PHIPA Compliance */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="phipa"
                checked={agreements.phipaCompliance}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({
                    ...prev,
                    phipaCompliance: checked === true,
                  }))
                }
                className="mt-1"
              />
              <label htmlFor="phipa" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium text-gray-800">
                  I understand and agree to comply with{" "}
                  <strong>PHIPA (Ontario)</strong> privacy requirements.
                </span>
              </label>
            </div>

            {/* PIPEDA Compliance */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="pipeda"
                checked={agreements.pipedaCompliance}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({
                    ...prev,
                    pipedaCompliance: checked === true,
                  }))
                }
                className="mt-1"
              />
              <label htmlFor="pipeda" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium text-gray-800">
                  I agree to handle personal health information in accordance
                  with <strong>PIPEDA</strong>.
                </span>
              </label>
            </div>

            {/* Medical License Active */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="license"
                checked={agreements.medicalLicenseActive}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({
                    ...prev,
                    medicalLicenseActive: checked === true,
                  }))
                }
                className="mt-1"
              />
              <label htmlFor="license" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium text-gray-800">
                  I confirm that my medical license is active and valid in
                  Canada.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceForm;
