"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
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
  onComplete: () => void;
  onCancel?: () => void;
}

const AvailabilityPreferencesForm: React.FC<
  AvailabilityPreferencesFormProps
> = ({ examinerProfileId, onComplete, onCancel: _onCancel }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "weeklyHours" | "overrideHours" | "bookingOptions"
  >("weeklyHours");

  const form = useForm<AvailabilityPreferencesInput>({
    schema: availabilityPreferencesSchema,
    defaultValues: availabilityInitialValues,
    mode: "onSubmit",
  });

  // Fetch availability preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!session?.user?.accountId) return;

      setLoading(true);
      try {
        // TODO: Implement getAvailabilityPreferencesAction
        // const result = await getAvailabilityPreferencesAction(session.user.accountId);
        // if (result.success && "data" in result && result.data) {
        //   form.reset(result.data);
        // }
      } catch (error) {
        console.error("Error fetching availability preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [session, form]);

  const onSubmit = async (values: AvailabilityPreferencesInput) => {
    if (!examinerProfileId) {
      console.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement updateAvailabilityPreferencesAction
      // const result = await updateAvailabilityPreferencesAction({
      //   examinerProfileId,
      //   ...values,
      //   activationStep: "availability",
      // });

      // if (result.success) {
      //   onComplete();
      // }

      // For now, just complete
      console.log("Availability preferences:", values);
      onComplete();
    } catch (error) {
      console.error("Error updating availability preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">Set Your Availability</h2>
        <Button
          type="submit"
          form="availability-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center gap-2"
          disabled={loading}>
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="relative mb-6 border border-gray-300 rounded-2xl bg-[#F0F3FC] p-2 pl-6">
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
