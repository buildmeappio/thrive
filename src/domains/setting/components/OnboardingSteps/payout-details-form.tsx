"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormProvider } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { updatePayoutDetailsAction } from "../../server/actions";
import {
  payoutDetailsSchema,
  PayoutDetailsInput,
} from "../../schemas/onboardingSteps.schema";
import {
  DirectDepositTab,
  ChequeTab,
  InteracTab,
  PayoutSection,
} from "./PayoutTabs";
import { toast } from "sonner";

import { InitialFormData } from "@/types/components";

interface PayoutDetailsFormProps {
  examinerProfileId: string | null;
  initialData: InitialFormData;
  onComplete: () => void;
  onCancel?: () => void;
}

const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
}) => {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>(
    (typeof initialData?.payoutMethod === "string" ? initialData.payoutMethod : undefined) || "direct_deposit"
  );

  const form = useForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaultValues: {
      payoutMethod: (
        typeof initialData?.payoutMethod === "string" &&
        (initialData.payoutMethod === "direct_deposit" ||
          initialData.payoutMethod === "cheque" ||
          initialData.payoutMethod === "interac")
          ? (initialData.payoutMethod as "direct_deposit" | "cheque" | "interac")
          : "direct_deposit"
      ),
      transitNumber: (typeof initialData?.transitNumber === "string" ? initialData.transitNumber : undefined) || "",
      institutionNumber: (typeof initialData?.institutionNumber === "string" ? initialData.institutionNumber : undefined) || "",
      accountNumber: (typeof initialData?.accountNumber === "string" ? initialData.accountNumber : undefined) || "",
      chequeMailingAddress: (typeof initialData?.chequeMailingAddress === "string" ? initialData.chequeMailingAddress : undefined) || "",
      interacEmail: (typeof initialData?.interacEmail === "string" ? initialData.interacEmail : undefined) || "",
    },
    mode: "onSubmit",
  });

  const payoutMethod = form.watch("payoutMethod");

  const handleSectionToggle = (section: string) => {
    if (expandedSection === section) {
      return; // Don't collapse if already expanded
    }
    setExpandedSection(section);
    if (section === "direct_deposit" || section === "cheque" || section === "interac") {
      const validPayoutMethod: "direct_deposit" | "cheque" | "interac" = section;
      form.setValue("payoutMethod", validPayoutMethod);
    }
  };

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
        
        // Redirect to dashboard after session is updated
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update payout details");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm ">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-medium">Set Up Payment Details</h2>
        <Button
          type="submit"
          form="payout-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading}>
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="payout-form">
        <div className="space-y-4 md:w-[500px]">
          <PayoutSection
            title="Direct Deposit"
            value="direct_deposit"
            isActive={payoutMethod === "direct_deposit"}
            isExpanded={expandedSection === "direct_deposit"}
            onToggle={() => handleSectionToggle("direct_deposit")}>
            <DirectDepositTab />
          </PayoutSection>

          <PayoutSection
            title="Cheque"
            value="cheque"
            isActive={payoutMethod === "cheque"}
            isExpanded={expandedSection === "cheque"}
            onToggle={() => handleSectionToggle("cheque")}>
            <ChequeTab />
          </PayoutSection>

          <PayoutSection
            title="Interac E-Transfer"
            value="interac"
            isActive={payoutMethod === "interac"}
            isExpanded={expandedSection === "interac"}
            onToggle={() => handleSectionToggle("interac")}>
            <InteracTab />
          </PayoutSection>
        </div>
      </FormProvider>
    </div>
  );
};

export default PayoutDetailsForm;
