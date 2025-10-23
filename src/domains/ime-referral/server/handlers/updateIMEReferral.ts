import ErrorMessages from '@/constants/ErrorMessages';
import iMEReferralService from '../imeReferral.service';
import { type IMEFormData } from '@/store/useImeReferral';

const updateIMEReferral = async (examinationId: string, data: IMEFormData, orgId: string) => {
  if (!data.step1 || !data.step2 || !data.step5) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  const result = await iMEReferralService.updateExamination(
    examinationId,
    {
      step1: data.step1,
      step2: data.step2,
      step3: data.step3,
      step4: data.step4,
      step5: data.step5,
      step6: data.step6,
      step7: data.step7,
    },
    orgId
  );

  return { success: true, result };
};

export default updateIMEReferral;
