"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useComplianceState, useComplianceSubmission } from "../../hooks";
import type { ComplianceFormProps } from "../../types";

const ComplianceForm: React.FC<ComplianceFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
  isSettingsPage = false,
  onDataUpdate,
}) => {
  const { agreements, updateAgreement } = useComplianceState({
    initialData,
    isCompleted,
    onStepEdited,
  });

  const { handleSubmit, handleMarkComplete, loading } = useComplianceSubmission(
    {
      examinerProfileId,
      agreements,
      onComplete,
      onMarkComplete,
      onDataUpdate,
      isSettingsPage,
    },
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm relative">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage
              ? "Compliance"
              : "Privacy & Compliance Acknowledgments"}
          </h2>
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <CircleCheck className="w-5 h-5 text-gray-700" />
            <span>Mark as Complete</span>
          </Button>
        )}
      </div>

      <div className={`space-y-4 ${isSettingsPage ? "pb-20" : ""}`}>
        <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
          <div className="space-y-6">
            {/* PHIPA Compliance */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="phipa"
                checked={agreements.phipaCompliance}
                onCheckedChange={(checked) =>
                  updateAgreement("phipaCompliance", checked === true)
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
                  updateAgreement("pipedaCompliance", checked === true)
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
                  updateAgreement("medicalLicenseActive", checked === true)
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
      {/* Save Changes Button - Bottom Right (Settings only) */}
      {isSettingsPage && (
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[#00A8FF] text-white hover:bg-[#0090d9] px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            disabled={loading}
          >
            <CircleCheck className="w-5 h-5 text-white" />
            <span>Save Changes</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ComplianceForm;
