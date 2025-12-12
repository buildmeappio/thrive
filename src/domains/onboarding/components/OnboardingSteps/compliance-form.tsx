"use client";
import React, { useState } from "react";
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
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState({
    phipaCompliance: initialData?.phipaCompliance ?? false,
    pipedaCompliance: initialData?.pipedaCompliance ?? false,
    medicalLicenseActive: initialData?.medicalLicenseActive ?? false,
  });

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
        activationStep: "compliance",
      });

      if (result.success) {
        toast.success("Compliance acknowledgments saved successfully");
        onComplete();

        // Update session to refresh JWT token with new activationStep
        await update();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-medium">
          Privacy & Compliance Acknowledgments
        </h2>
        <Button
          type="button"
          onClick={handleSubmit}
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={
            loading ||
            !agreements.phipaCompliance ||
            !agreements.pipedaCompliance ||
            !agreements.medicalLicenseActive
          }
        >
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
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
