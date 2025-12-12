"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { updateNotificationsAction } from "../../server/actions";
import type { NotificationsFormProps } from "../../types";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  required?: boolean;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "emailNewIMEs",
    label: "Email notifications for new IMEs",
    description: "Receive email alerts when new IME cases are assigned to you",
    enabled: true,
    required: false,
  },
  {
    id: "emailInterviewRequests",
    label: "Email notifications for interview requests",
    description: "Get notified when claimants request interviews",
    enabled: true,
    required: false,
  },
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
}) => {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    emailNewIMEs: initialData?.emailNewIMEs ?? true,
    emailInterviewRequests: initialData?.emailInterviewRequests ?? true,
    emailPaymentPayout: initialData?.emailPaymentPayout ?? true,
    smsNotifications: initialData?.smsNotifications ?? false,
    emailMarketing: initialData?.emailMarketing ?? false,
  });

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await updateNotificationsAction({
        examinerProfileId,
        emailNewIMEs: notifications.emailNewIMEs,
        emailInterviewRequests: notifications.emailInterviewRequests,
        emailPaymentPayout: notifications.emailPaymentPayout,
        smsNotifications: notifications.smsNotifications,
        emailMarketing: notifications.emailMarketing,
        activationStep: "notifications",
      });

      if (result.success) {
        toast.success("Notification settings saved successfully");
        onComplete();

        // Update session to refresh JWT token with new activationStep
        await update();

        // Redirect to dashboard after session is updated
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save notification settings");
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
        <h2 className="text-2xl font-medium">Notification Settings</h2>
        <Button
          type="button"
          onClick={handleSubmit}
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading}
        >
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      <div className="space-y-4">
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
                    aria-checked={notifications[setting.id]}
                    onClick={() => toggleNotification(setting.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:ring-offset-2 ${
                      notifications[setting.id] ? "bg-[#00A8FF]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[setting.id]
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
    </div>
  );
};

export default NotificationsForm;
