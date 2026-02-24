'use client';
import { useState, useEffect, useMemo, useRef } from 'react';

interface NotificationSettings {
  emailPaymentPayout: boolean;
  smsNotifications: boolean;
  emailMarketing: boolean;
}

interface UseNotificationsStateOptions {
  initialData?: {
    emailPaymentPayout?: boolean | null;
    smsNotifications?: boolean | null;
    emailMarketing?: boolean | null;
  };
  isCompleted?: boolean;
  onStepEdited?: () => void;
}

/**
 * Hook for managing notifications state and change detection
 */
export function useNotificationsState({
  initialData,
  isCompleted = false,
  onStepEdited,
}: UseNotificationsStateOptions) {
  const initialNotifications = useMemo<NotificationSettings>(() => {
    return {
      emailPaymentPayout: initialData?.emailPaymentPayout ?? true,
      smsNotifications: initialData?.smsNotifications ?? false,
      emailMarketing: initialData?.emailMarketing ?? false,
    };
  }, [initialData]);

  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications);
  const isInitializedRef = useRef(false);

  // Update state when initialNotifications change
  useEffect(() => {
    setNotifications(initialNotifications);
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }
  }, [initialNotifications]);

  // Check if form values have changed from initial saved values
  const hasFormChanged = useMemo(() => {
    if (!isInitializedRef.current) return false;
    const currentHash = JSON.stringify(notifications);
    const initialHash = JSON.stringify(initialNotifications);
    return currentHash !== initialHash;
  }, [notifications, initialNotifications]);

  // If notifications change and step is completed, mark as incomplete
  useEffect(() => {
    if (hasFormChanged && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [hasFormChanged, isCompleted, onStepEdited]);

  const toggleNotification = (id: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return {
    notifications,
    toggleNotification,
    hasFormChanged,
    initialNotifications,
  };
}
