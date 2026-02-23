'use server';
import ErrorMessages from '@/constants/ErrorMessages';
import { verifyOrgInfoRequestToken } from '@/lib/jwt';
import authService from '../auth.service';
import { type FormData } from '@/store/useRegistration';

const updateOrganizationData = async (token: string, data: FormData) => {
  // Verify the organization info request token
  const payload = verifyOrgInfoRequestToken(token);
  if (!payload?.email || !payload?.organizationId) {
    throw new Error(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
  }

  // Verify email matches
  if (data.step2?.officialEmailAddress !== payload.email) {
    throw new Error(ErrorMessages.MISMATCH_EMAIL);
  }

  // Validate all required steps are present
  if (!data.step1 || !data.step2 || !data.step3) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  // Update organization data (password is not required for updates)
  const result = await authService.updateOrganizationData(payload.organizationId, {
    ...data.step1,
    ...data.step2,
    ...data.step3,
  });

  return {
    success: true,
    message: 'Organization information updated successfully',
    ...result,
  };
};

export default updateOrganizationData;
