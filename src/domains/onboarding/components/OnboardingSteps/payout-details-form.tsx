"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { CircleCheck, Shield, CheckCircle2 } from "lucide-react";
import { updatePayoutDetailsAction } from "../../server/actions";
import {
  payoutDetailsSchema,
  PayoutDetailsInput,
} from "../../schemas/onboardingSteps.schema";
import { DirectDepositTab, ChequeTab, InteracTab } from "./PayoutTabs";
import { toast } from "sonner";

import type { PayoutDetailsFormProps } from "../../types";

const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "direct_deposit" | "interac" | "cheque"
  >("direct_deposit");

  const form = useForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaultValues: {
      payoutMethod: undefined, // No longer required
      legalName:
        (typeof initialData?.legalName === "string"
          ? initialData.legalName
          : undefined) || "",
      sin:
        (typeof initialData?.sin === "string" ? initialData.sin : undefined) ||
        "",
      transitNumber:
        (typeof initialData?.transitNumber === "string"
          ? initialData.transitNumber
          : undefined) || "",
      institutionNumber:
        (typeof initialData?.institutionNumber === "string"
          ? initialData.institutionNumber
          : undefined) || "",
      accountNumber:
        (typeof initialData?.accountNumber === "string"
          ? initialData.accountNumber
          : undefined) || "",
      chequeMailingAddress:
        (typeof initialData?.chequeMailingAddress === "string"
          ? initialData.chequeMailingAddress
          : undefined) || "",
      interacEmail:
        (typeof initialData?.interacEmail === "string"
          ? initialData.interacEmail
          : undefined) || "",
      autodepositEnabled:
        (typeof initialData?.autodepositEnabled === "boolean"
          ? initialData.autodepositEnabled
          : undefined) || false,
    },
    mode: "onSubmit",
  });

  // Watch form values to determine completion status
  const formValues = form.watch();

  // Helper function to check if a payment method is complete
  const isDirectDepositComplete = () => {
    const { legalName, sin, transitNumber, institutionNumber, accountNumber } =
      formValues;
    return (
      legalName &&
      legalName.length > 0 &&
      sin &&
      sin.length === 9 &&
      transitNumber &&
      transitNumber.length === 5 &&
      institutionNumber &&
      institutionNumber.length === 3 &&
      accountNumber &&
      accountNumber.length >= 7 &&
      accountNumber.length <= 12
    );
  };

  const isChequeComplete = () => {
    return (
      formValues.chequeMailingAddress &&
      formValues.chequeMailingAddress.length > 0
    );
  };

  const isInteracComplete = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formValues.interacEmail && emailRegex.test(formValues.interacEmail);
  };

  const onSubmit = async (values: PayoutDetailsInput) => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      // Remove payoutMethod if undefined to avoid type issues
      const { payoutMethod, ...restValues } = values;
      const result = await updatePayoutDetailsAction({
        examinerProfileId,
        ...restValues,
        ...(payoutMethod && { payoutMethod }), // Only include if defined
        activationStep: "payout", // Mark step 4 as completed
      });

      if (result.success) {
        toast.success("Payout details saved successfully");
        onComplete();

        // Update session to refresh JWT token with new activationStep
        await update();

        // Don't redirect here - let the user continue to next step
        // router.push("/dashboard");
        // router.refresh();
      } else {
        toast.error(result.message || "Failed to update payout details");
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
        <h2 className="text-2xl font-medium">Set Up Your Payout Method</h2>
        <Button
          type="submit"
          form="payout-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading}
        >
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Encryption Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>All your financial information is encrypted</strong> and
          stored securely. We use industry-standard encryption to protect your
          sensitive data.
        </p>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="payout-form">
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="relative border border-gray-300 rounded-2xl bg-[#F0F3FC] p-2 pl-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("direct_deposit")}
                className={`pb-2 px-4 transition-colors cursor-pointer relative flex items-center gap-2 ${
                  activeTab === "direct_deposit"
                    ? "text-black font-bold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>Direct Deposit</span>
                {isDirectDepositComplete() && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {activeTab === "direct_deposit" && (
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("interac")}
                className={`pb-2 px-4 transition-colors cursor-pointer relative flex items-center gap-2 ${
                  activeTab === "interac"
                    ? "text-black font-bold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>Interac e-Transfer</span>
                {isInteracComplete() && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {activeTab === "interac" && (
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cheque")}
                className={`pb-2 px-4 transition-colors cursor-pointer relative flex items-center gap-2 ${
                  activeTab === "cheque"
                    ? "text-black font-bold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>Bank Transfer (Void Cheque)</span>
                {isChequeComplete() && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {activeTab === "cheque" && (
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
            {activeTab === "direct_deposit" && <DirectDepositTab />}
            {activeTab === "interac" && <InteracTab />}
            {activeTab === "cheque" && <ChequeTab />}
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can fill in one or more payment
              methods. At least one complete payment method is required to
              proceed.
            </p>
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default PayoutDetailsForm;
