'use server';

import { type FormData } from '@/store/useRegistration';
import { authHandlers } from './server';

export const checkUserByEmail = async (email: string) => {
  const exists = await authHandlers.checkUserByEmail(email);
  return exists;
};

export const sendOtp = async (email: string) => {
  const result = await authHandlers.sendOtp(email);
  return result;
};

export const verifyOtp = async (otp: string, email: string) => {
  const result = await authHandlers.verifyOtp(otp, email);
  return result;
};

export const getDepartments = async () => {
  const departments = await authHandlers.getDepartments();
  return departments;
};

export const getRequestedSpecialties = async () => {
  const specialties = await authHandlers.getRequestedSpecialties();
  return specialties;
};

export const getCaseTypes = async () => {
  const caseTypes = await authHandlers.getCaseTypes();
  return caseTypes;
};

export const getExamFormats = async () => {
  const examFormats = await authHandlers.getExamFormats();
  return examFormats;
};

export const registerOrganization = async (data: FormData) => {
  const result = await authHandlers.registerOrganization(data);
  return result;
};
