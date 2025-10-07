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

export const getExaminationTypes = async () => {
  const examinationTypes = await authHandlers.getExaminationTypes();
  return examinationTypes;
};

export const registerOrganization = async (data: FormData) => {
  const result = await authHandlers.registerOrganization(data);
  return result;
};

export const createPassword = async (email: string, password: string) => {
  const result = await authHandlers.createPassword(email, password);
  return result;
};

export const sendResetPasswordLink = async (email: string) => {
  const result = await authHandlers.sendResetPasswordLink(email);
  return result;
};

export const verifyResetToken = async (token: string) => {
  const result = await authHandlers.verifyResetToken(token);
  return result;
};

export const resetPassword = async (token: string, password: string) => {
  const result = await authHandlers.resetPassword(token, password);
  return result;
};
