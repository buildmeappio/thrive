import { dashboardService } from '@/domains/setting/server/services/dashboard.service';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

export type UpdateNotificationsInput = {
  examinerProfileId: string;
  emailPaymentPayout?: boolean;
  smsNotifications?: boolean;
  emailMarketing?: boolean;
  activationStep?: string;
};

const updateNotifications = async (payload: UpdateNotificationsInput) => {
  try {
    const updatedProfile = await dashboardService.updateNotifications(payload.examinerProfileId, {
      emailPaymentPayout: payload.emailPaymentPayout,
      smsNotifications: payload.smsNotifications,
      emailMarketing: payload.emailMarketing,
      activationStep: payload.activationStep,
    });

    return {
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error('Error updating notifications:', error);
    throw HttpError.internalServerError(ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE);
  }
};

export default updateNotifications;
