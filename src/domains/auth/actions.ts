'use server';

import { type FormData } from '@/store/useRegistration';
import { authHandlers } from './server';
import { handleAction } from '@/utils/action';

export const checkUserByEmail = async (email: string) => {
  return await handleAction(
    async () => await authHandlers.checkUserByEmail(email),
    'Failed to check user by email'
  );
};

export const sendOtp = async (email: string) => {
  return await handleAction(async () => await authHandlers.sendOtp(email), 'Failed to send OTP');
};

export const verifyOtp = async (otp: string, email: string) => {
  return await handleAction(
    async () => await authHandlers.verifyOtp(otp, email),
    'Failed to verify OTP'
  );
};

export const registerOrganization = async (data: FormData) => {
  return await handleAction(
    async () => await authHandlers.registerOrganization(data),
    'Failed to register organization'
  );
};

export const createPassword = async (email: string, password: string) => {
  return await handleAction(
    async () => await authHandlers.createPassword(email, password),
    'Failed to create password'
  );
};

export const sendResetPasswordLink = async (email: string) => {
  return await handleAction(
    async () => await authHandlers.sendResetPasswordLink(email),
    'Failed to send reset password link'
  );
};

export const verifyResetToken = async (token: string) => {
  return await handleAction(
    async () => await authHandlers.verifyResetToken(token),
    'Failed to verify reset token'
  );
};

export const resetPassword = async (token: string, password: string) => {
  return await handleAction(
    async () => await authHandlers.resetPassword(token, password),
    'Failed to reset password'
  );
};
