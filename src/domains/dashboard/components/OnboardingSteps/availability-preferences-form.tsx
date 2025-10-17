"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/use-form-hook";
import { FormProvider } from "@/components/form";
import { CircleCheck } from "lucide-react";
import {
  availabilityPreferencesSchema,
  AvailabilityPreferencesInput,
} from "../../schemas/onboardingSteps.schema";
import { availabilityInitialValues } from "../../constants";
import { WeeklyHours, OverrideHours, BookingOptions } from "./AvailabilityTabs";

interface AvailabilityPreferencesFormProps {
  examinerProfileId: string | null;
  initialData: any;
  onComplete: () => void;
  onCancel?: () => void;
}

const AvailabilityPreferencesForm: React.FC<
  AvailabilityPreferencesFormProps
> = ({ examinerProfileId, initialData, onComplete, onCancel: _onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "weeklyHours" | "overrideHours" | "bookingOptions"
  >("weeklyHours");

  const form = useForm<AvailabilityPreferencesInput>({
    schema: availabilityPreferencesSchema,
    defaultValues: initialData || availabilityInitialValues,
    mode: "onSubmit",
  });

  const onSubmit = async (values: AvailabilityPreferencesInput) => {
    if (!examinerProfileId) {
      console.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const { saveAvailabilityAction } = await import("../../server/actions");
      const result = await saveAvailabilityAction({
        examinerProfileId,
        weeklyHours: values.weeklyHours,
        overrideHours: values.overrideHours,
        bookingOptions: values.bookingOptions,
        activationStep: "availability",
      });

      if (result.success) {
        onComplete();
      } else {
        console.error("Failed to save availability:", result.message);
      }
    } catch (error) {
      console.error("Error updating availability preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl px-8 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-medium">Set Your Availability</h2>
        <Button
          type="submit"
          form="availability-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading}>
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="relative border border-gray-300 rounded-2xl bg-[#F0F3FC] p-2 pl-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("weeklyHours")}
            className={`pb-2 px-4  transition-colors cursor-pointer relative ${
              activeTab === "weeklyHours"
                ? "text-black font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Weekly Hours
            {activeTab === "weeklyHours" && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("overrideHours")}
            className={`pb-2 px-4 transition-colors cursor-pointer relative ${
              activeTab === "overrideHours"
                ? "text-black font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Override Hours
            {activeTab === "overrideHours" && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookingOptions")}
            className={`pb-2 px-4 transition-colors cursor-pointer relative ${
              activeTab === "bookingOptions"
                ? "text-black font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Booking Options
            {activeTab === "bookingOptions" && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button>
        </div>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="availability-form">
        {/* Weekly Hours Tab */}
        {activeTab === "weeklyHours" && <WeeklyHours form={form} />}

        {/* Override Hours Tab */}
        {activeTab === "overrideHours" && <OverrideHours form={form} />}

        {/* Booking Options Tab */}
        {activeTab === "bookingOptions" && <BookingOptions form={form} />}
      </FormProvider>
    </div>
  );
};

export default AvailabilityPreferencesForm;
