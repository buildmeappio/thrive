"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, FormField } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { CircleCheck, Shield } from "lucide-react";
import { updatePayoutDetailsAction } from "../../server/actions";
import {
  payoutDetailsSchema,
  PayoutDetailsInput,
} from "../../schemas/onboardingSteps.schema";
import { DirectDepositTab, ChequeTab, InteracTab } from "./PayoutTabs";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import type { PayoutDetailsFormProps } from "../../types";

const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  const form = useForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaultValues: {
      payoutMethod:
        typeof initialData?.payoutMethod === "string" &&
        (initialData.payoutMethod === "direct_deposit" ||
          initialData.payoutMethod === "cheque" ||
          initialData.payoutMethod === "interac")
          ? (initialData.payoutMethod as
              | "direct_deposit"
              | "cheque"
              | "interac")
          : "direct_deposit",
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

  const payoutMethod = form.watch("payoutMethod");

  const onSubmit = async (values: PayoutDetailsInput) => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await updatePayoutDetailsAction({
        examinerProfileId,
        ...values,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Payout Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payout Method
            </h3>
            <FormField name="payoutMethod" required>
              {(_field) => (
                <RadioGroup
                  value={payoutMethod || "direct_deposit"}
                  onValueChange={(value) => {
                    form.setValue(
                      "payoutMethod",
                      value as "direct_deposit" | "cheque" | "interac",
                    );
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem
                      value="direct_deposit"
                      id="direct_deposit"
                    />
                    <Label
                      htmlFor="direct_deposit"
                      className="cursor-pointer flex-1"
                    >
                      Stripe Direct Deposit
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="interac" id="interac" />
                    <Label htmlFor="interac" className="cursor-pointer flex-1">
                      Interac e-Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="cheque" id="cheque" />
                    <Label htmlFor="cheque" className="cursor-pointer flex-1">
                      Bank Transfer (Void Cheque)
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </FormField>
          </div>

          {/* Right Column: Conditional Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Details
            </h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
              {payoutMethod === "direct_deposit" && <DirectDepositTab />}
              {payoutMethod === "interac" && <InteracTab />}
              {payoutMethod === "cheque" && <ChequeTab />}
              {!payoutMethod && (
                <p className="text-gray-500 text-sm">
                  Please select a payout method to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default PayoutDetailsForm;
