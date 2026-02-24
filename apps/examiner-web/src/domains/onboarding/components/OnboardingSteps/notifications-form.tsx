'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleCheck } from 'lucide-react';
import { useNotificationsState, useNotificationsSubmission } from '../../hooks';
import type { NotificationsFormProps } from '../../types';

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
    id: 'emailPaymentPayout',
    label: 'Payment/payout notifications',
    description: 'Receive updates about payments and payouts',
    enabled: true,
    required: false,
  },
  {
    id: 'smsNotifications',
    label: 'Text message notifications',
    description: 'Optional SMS alerts for urgent updates',
    enabled: false,
    required: false,
  },
  {
    id: 'emailMarketing',
    label: 'Marketing/product updates',
    description: 'Receive newsletters and product announcements',
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

  const { handleSubmit, handleMarkComplete, loading } = useNotificationsSubmission({
    examinerProfileId,
    notifications,
    onComplete,
    onMarkComplete,
    onDataUpdate,
    isSettingsPage,
  });

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">Notification Settings</h2>
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            <span>Mark as Complete</span>
            <CircleCheck className="h-5 w-5 text-gray-700" />
          </Button>
        )}
      </div>

      <div className={`space-y-4 ${isSettingsPage ? 'pb-20' : ''}`}>
        <div className="rounded-lg border border-gray-200 bg-[#FCFDFF] p-6">
          <div className="space-y-6">
            {NOTIFICATION_SETTINGS.map(setting => (
              <div key={setting.id} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label
                    htmlFor={setting.id}
                    className="block cursor-pointer text-sm font-medium text-gray-800"
                  >
                    {setting.label}
                  </label>
                  <p className="mt-1 text-xs text-gray-500">{setting.description}</p>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications[setting.id as keyof typeof notifications]}
                    onClick={() => toggleNotification(setting.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:ring-offset-2 ${
                      notifications[setting.id as keyof typeof notifications]
                        ? 'bg-[#00A8FF]'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[setting.id as keyof typeof notifications]
                          ? 'translate-x-6'
                          : 'translate-x-1'
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
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#00A8FF] px-6 py-2 text-white shadow-lg hover:bg-[#0090d9] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            <span>Save Changes</span>
            <CircleCheck className="h-5 w-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsForm;
