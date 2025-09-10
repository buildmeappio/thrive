import ErrorMessages from '@/constants/ErrorMessages';
import iMEReferralService from '../imeReferral.service';
import { type IMEFormData } from '@/store/useIMEReferralStore';

const createIMEReferral = async (data: IMEFormData, isDraft: boolean) => {
  if (!data.step1 || !data.step2 || !data.step3) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  const result = await iMEReferralService.createIMEReferralWithClaimant({
    step1: data.step1,
    step2: data.step2,
    step3: data.step3,
    isDraft,
  });

  return { success: true, result };
};

export default createIMEReferral;
