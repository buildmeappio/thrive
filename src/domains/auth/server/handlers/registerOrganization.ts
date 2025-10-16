'use server';
import ErrorMessages from '@/constants/ErrorMessages';
import { verifyPasswordToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import authService from '../auth.service';
import { type FormData } from '@/store/useRegistration';

const registerOrganization = async (data: FormData) => {
  const token = (await cookies()).get('password_token')?.value;
  if (!token) throw new Error(ErrorMessages.PASSWORD_TOKEN_REQUIRED);

  const payload = verifyPasswordToken(token);
  if (!payload?.email) throw new Error(ErrorMessages.INVALID_PASSWORD_TOKEN);

  if (data.step2?.officialEmailAddress !== payload.email) {
    throw new Error(ErrorMessages.MISMATCH_EMAIL);
  }

  if (!data.step1 || !data.step2 || !data.step3 || !data.step4) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  const result = await authService.createOrganizationWithUser({
    ...data.step1,
    ...data.step2,
    ...data.step3,
    ...data.step4,
  });

  (await cookies()).set('password_token', '', { maxAge: 0 });

  return result;
};

export default registerOrganization;
