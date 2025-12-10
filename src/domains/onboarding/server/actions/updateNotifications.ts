"use server";

import updateNotificationsHandler from "../handlers/updateNotifications";

export const updateNotificationsAction = async (data: {
  examinerProfileId: string;
  emailNewIMEs?: boolean;
  emailInterviewRequests?: boolean;
  emailPaymentPayout?: boolean;
  smsNotifications?: boolean;
  emailMarketing?: boolean;
  activationStep?: string;
}) => {
  try {
    return await updateNotificationsHandler(data);
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message: (error instanceof Error ? error.message : undefined) || "Failed to update notification settings",
    };
  }
};

