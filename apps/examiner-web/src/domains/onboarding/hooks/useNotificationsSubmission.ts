'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateNotificationsAction } from '../server/actions';

interface NotificationSettings {
  emailPaymentPayout: boolean;
  smsNotifications: boolean;
  emailMarketing: boolean;
}

interface UseNotificationsSubmissionOptions {
  examinerProfileId: string | null;
  notifications: NotificationSettings;
  onComplete: () => void;
  onMarkComplete?: () => void;
  onDataUpdate?: (data: NotificationSettings) => void;
  isSettingsPage?: boolean;
}

/**
 * Hook for handling notifications form submission
 */
export function useNotificationsSubmission({
  examinerProfileId,
  notifications,
  onComplete,
  onMarkComplete,
  onDataUpdate,
  isSettingsPage = false,
}: UseNotificationsSubmissionOptions) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== 'string') {
      toast.error('Examiner profile ID not found');
      return;
    }

    setLoading(true);
    try {
      const result = await updateNotificationsAction({
        examinerProfileId,
        emailPaymentPayout: notifications.emailPaymentPayout,
        smsNotifications: notifications.smsNotifications,
        emailMarketing: notifications.emailMarketing,
      });

      if (result.success) {
        // Update parent component's data state if callback is provided (for settings page)
        if (onDataUpdate && isSettingsPage) {
          onDataUpdate(notifications);
        }
        toast.success('Notification settings saved successfully');
        onComplete();
      } else {
        toast.error(result.message || 'Failed to save notification settings');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== 'string') {
      toast.error('Examiner profile ID not found');
      return;
    }

    setLoading(true);
    try {
      const result = await updateNotificationsAction({
        examinerProfileId,
        emailPaymentPayout: notifications.emailPaymentPayout,
        smsNotifications: notifications.smsNotifications,
        emailMarketing: notifications.emailMarketing,
      });

      if (result.success) {
        toast.success('Notification settings saved and marked as complete');
        if (onMarkComplete) {
          onMarkComplete();
        }
        onComplete();
      } else {
        toast.error(result.message || 'Failed to save notification settings');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    handleMarkComplete,
    loading,
  };
}
