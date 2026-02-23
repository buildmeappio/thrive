"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { useNotificationsState, useNotificationsSubmission } from "../../hooks";
import type { NotificationsFormProps } from "../../types";

interface NotificationSettings {
  emailPaymentPayout: boolean;
  smsNotifications: boolean;
  emailMarketing: boolean;
}

interface NotificationSetting {
  id: keyof NotificationSettings;
  label: string;
  description: string;
  enabled: boolean;
  required?: boolean;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "emailPaymentPayout",
    label: "Payment/payout notifications",
    description: "Receive updates about payments and payouts",
    enabled: true,
    required: false,
  },
  {
    id: "smsNotifications",
    label: "Text message notifications",
    description: "Optional SMS alerts for urgent updates",
    enabled: false,
    required: false,
  },
  {
    id: "emailMarketing",
    label: "Marketing/product updates",
    description: "Receive newsletters and product announcements",
    enabled: false,
    required: false,
  },
];

const NotificationsForm: React.FC<NotificationsFormProps> = ({
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
  const { notifications, toggleNotification } = useNotificationsState({
    initialData,
    isCompleted,
    onStepEdited,
  });

  const { handleSubmit, handleMarkComplete, loading } =
    useNotificationsSubmission({
      examinerProfileId,
      notifications,
      onComplete,
      onMarkComplete,
      onDataUpdate,
      isSettingsPage,
    });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm relative">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">Notification Settings</h2>
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
            disabled={loading}
          >
            <span>Mark as Complete</span>
            <CircleCheck className="w-5 h-5 text-gray-700" />
          </Button>
        )}
      </div>

      <div className={`space-y-4 ${isSettingsPage ? "pb-20" : ""}`}>
        <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
          <div className="space-y-6">
            {NOTIFICATION_SETTINGS.map((setting) => (
              <div
                key={setting.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <label
                    htmlFor={setting.id}
                    className="text-sm font-medium text-gray-800 cursor-pointer block"
                  >
                    {setting.label}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {setting.description}
                  </p>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      notifications[setting.id as keyof typeof notifications]
                    }
                    onClick={() => toggleNotification(setting.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:ring-offset-2 ${
                      notifications[setting.id as keyof typeof notifications]
                        ? "bg-[#00A8FF]"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[setting.id as keyof typeof notifications]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
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
            <span>Save Changes</span>
            <CircleCheck className="w-5 h-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsForm;
