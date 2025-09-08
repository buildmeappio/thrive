import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyPasswordToken } from '@/lib/jwt';
import service from './organization.service';
import { type FormData } from '@/store/useRegistrationStore';
import ErrorMessages from '@/constants/ErrorMessages';
import type { IMEFormData } from '@/store/useIMEReferralStore';

const checkOrganizationName = async (name: string): Promise<boolean> => {
  if (!name) return false;
  const org = await service.findOrganizationByName(name);
  return !!org;
};

const checkUserEmail = async (email: string): Promise<boolean> => {
  if (!email) return false;
  const org = await service.findUserByEmail(email);
  return !!org;
};

const registerOrganization = async (data: FormData) => {
  if (!data.step1 || !data.step2 || !data.step3 || !data.step4 || !data.step5) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  const { password } = data.step5;
  const hashedPassword = await bcrypt.hash(password, 10);

  return service.createOrganizationWithUser({
    ...data.step1,
    ...data.step2,
    ...data.step3,
    ...data.step4,
    hashedPassword,
  });
};

const finalizeOrganizationRegistration = async (data: FormData) => {
  const token = (await cookies()).get('password_token')?.value;
  if (!token) throw new Error(ErrorMessages.PASSWORD_TOKEN_REQUIRED);

  const payload = verifyPasswordToken(token);
  if (!payload?.email) throw new Error(ErrorMessages.INVALID_PASSWORD_TOKEN);

  if (data.step2?.officialEmailAddress !== payload.email) {
    throw new Error(ErrorMessages.MISMATCH_EMAIL);
  }

  const result = await registerOrganization(data);

  (await cookies()).set('password_token', '', { maxAge: 0 });

  return { success: true, result };
};

const getOrganizationType = async () => {
  return { success: true, result: await service.getOrganizationType() };
};

const getDepartment = async () => {
  return { success: true, result: await service.getDepartments() };
};

const acceptOrganization = async (id: string) => {
  return { success: true, result: await service.acceptOrganization(id) };
};

const getOrganization = async (id: string) => {
  return { success: true, result: await service.getOrganization(id) };
};

const getCaseType = async () => {
  return { success: true, result: await service.getCaseType() };
};

const getExamFormat = async () => {
  return { success: true, result: await service.getExamFormat() };
};

const getRequestedSpecialty = async () => {
  return { success: true, result: await service.getRequestedSpecialty() };
};

const createIMEReferral = async (data: IMEFormData) => {
  if (!data.step1 || !data.step2 || !data.step3 || !data.step4) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  return service.createIMEReferralWithClaimant({
    firstName: data.step1.firstName,
    lastName: data.step1.lastName,
    dob: data.step1.dob,
    gender: data.step1.gender,
    phone: data.step1.phone,
    email: data.step1.email,
    addressLookup: data.step1.addressLookup,
    street: data.step1.street,
    apt: data.step1.apt,
    city: data.step1.city,
    postalCode: data.step1.postalCode,
    province: data.step1.province,
    reason: data.step2.reason,
    caseType: data.step2.caseType,
    urgencyLevel: data.step2.urgencyLevel,
    examFormat: data.step2.examFormat,
    requestedSpecialty: data.step2.requestedSpecialty,
    preferredLocation: data.step2.preferredLocation,
    files: data.step3.files,
    consentConfirmation: data.step4.consentConfirmation,
  });
};

const handler = {
  checkOrganizationName,
  checkUserEmail,
  registerOrganization,
  createIMEReferral,
  finalizeOrganizationRegistration,
  getOrganizationType,
  getDepartment,
  acceptOrganization,
  getOrganization,
  getCaseType,
  getExamFormat,
  getRequestedSpecialty,
};

export default handler;
