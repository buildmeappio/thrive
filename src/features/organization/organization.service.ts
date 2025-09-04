import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyPasswordToken } from '@/lib/jwt';
import handler from './organization.handler';
import { type FormData } from '@/store/useRegistrationStore';
import ErrorMessages from '@/constants/ErrorMessages';

const checkOrganizationNameService = async (name: string): Promise<boolean> => {
  if (!name) return false;
  const org = await handler.findOrganizationByName(name);
  return !!org;
};

const checkUserEmailService = async (email: string): Promise<boolean> => {
  if (!email) return false;
  const org = await handler.findUserByEmail(email);
  return !!org;
};

const registerOrganizationService = async (data: FormData) => {
  if (!data.step1 || !data.step2 || !data.step3) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  // this step
  if (!data.step5) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  const { password } = data.step5;
  const hashedPassword = await bcrypt.hash(password, 10);

  return handler.createOrganizationWithUser({
    ...data.step1,
    ...data.step2,
    ...data.step3,
    hashedPassword,
  });
};

const finalizeOrganizationRegistrationService = async (data: FormData) => {
  const token = (await cookies()).get('password_token')?.value;
  if (!token) throw new Error(ErrorMessages.PASSWORD_TOKEN_REQUIRED);

  const payload = verifyPasswordToken(token);
  if (!payload?.email) throw new Error(ErrorMessages.INVALID_PASSWORD_TOKEN);

  if (data.step2?.officialEmailAddress !== payload.email) {
    throw new Error(ErrorMessages.MISMATCH_EMAIL);
  }

  const result = await registerOrganizationService(data);

  (await cookies()).set('password_token', '', { maxAge: 0 });

  return { success: true, result };
};

const getOrganizationTypeService = async () => {
  return { success: true, result: await handler.getOrganizationType() };
};

const getDepartmentService = async () => {
  return { success: true, result: await handler.getDepartments() };
};

const acceptOrganizationService = async (id: string) => {
  return { success: true, result: await handler.acceptOrganization(id) };
};

const getOrganizationService = async (id: string) => {
  return { success: true, result: await handler.getOrganization(id) };
};

const getCaseTypeService = async () => {
  return { success: true, result: await handler.getCaseType() };
};

const getExamFormatService = async () => {
  return { success: true, result: await handler.getExamFormat() };
};

const getRequestedSpecialtyService = async () => {
  return { success: true, result: await handler.getRequestedSpecialty() };
};

export default {
  checkOrganizationNameService,
  checkUserEmailService,
  registerOrganizationService,
  finalizeOrganizationRegistrationService,
  getOrganizationTypeService,
  getDepartmentService,
  acceptOrganizationService,
  getOrganizationService,
  getCaseTypeService,
  getExamFormatService,
  getRequestedSpecialtyService,
};
