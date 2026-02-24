import { dashboardService } from '@/domains/setting/server/services/dashboard.service';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

export type GetPayoutDetailsInput = {
  accountId: string;
};

const getPayoutDetails = async (payload: GetPayoutDetailsInput) => {
  const examinerProfile = await dashboardService.getExaminerProfileByAccountId(payload.accountId);

  if (!examinerProfile) {
    throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
  }

  // Type assertion for new fields
  const profile = examinerProfile as typeof examinerProfile & {
    payoutMethod?: string | null;
    transitNumber?: string | null;
    institutionNumber?: string | null;
    accountNumber?: string | null;
  };

  return {
    success: true,
    data: {
      id: profile.id,
      payoutMethod: profile.payoutMethod || 'direct_deposit',
      transitNumber: profile.transitNumber || '',
      institutionNumber: profile.institutionNumber || '',
      accountNumber: profile.accountNumber || '',
    },
  };
};

export default getPayoutDetails;
