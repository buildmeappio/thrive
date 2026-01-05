"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FeeStructureStep } from "./send-contract-steps/FeeStructureStep";
import { ContractVariablesStep } from "./send-contract-steps/ContractVariablesStep";
import { PreviewStep } from "./send-contract-steps/PreviewStep";

type Props = {
  applicationId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export type ContractVariables = {
  // Contract variables
  province?: string;
  effective_date?: string;

  // Thrive/Organization variables
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
};

export function SendContractDialog({
  applicationId,
  onClose,
  onSuccess,
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeeStructureId, setSelectedFeeStructureId] =
    useState<string>("");
  const [contractVariables, setContractVariables] = useState<ContractVariables>(
    {},
  );
  const [contractId, setContractId] = useState<string | null>(null);

  const handleFeeStructureNext = (
    feeStructureId: string,
    createdContractId: string,
  ) => {
    setSelectedFeeStructureId(feeStructureId);
    setContractId(createdContractId);
    setCurrentStep(2);
  };

  const handleVariablesNext = (variables: ContractVariables) => {
    setContractVariables(variables);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Send Contract
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step
                        ? "bg-blue-600 text-white"
                        : currentStep > step
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step ? "✓" : step}
                  </div>
                  <div className="ml-2 text-sm">
                    <div
                      className={`font-medium ${
                        currentStep === step ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {step === 1 && "Fee Structure"}
                      {step === 2 && "Contract Details"}
                      {step === 3 && "Preview & Send"}
                    </div>
                  </div>
                  {step < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto">
          {currentStep === 1 && (
            <FeeStructureStep
              applicationId={applicationId}
              onNext={handleFeeStructureNext}
              onCancel={onClose}
            />
          )}

          {currentStep === 2 && contractId && (
            <ContractVariablesStep
              contractId={contractId}
              initialValues={contractVariables}
              onNext={handleVariablesNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && contractId && (
            <PreviewStep
              contractId={contractId}
              variables={contractVariables}
              onBack={handleBack}
              onSendSuccess={handleSendSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}
