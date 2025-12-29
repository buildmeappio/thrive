'use server';

import { type FormData } from '@/store/useRegistration';
import { authHandlers } from './server';
import { handleAction } from '@/utils/action';
import { UpdateOrganizationInfo } from './types/updateOrganizationInfo';
import { getCurrentUser } from './server/session';

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

export const changePassword = async (email: string, oldPassword: string, newPassword: string) => {
  return await handleAction(
    async () => await authHandlers.changePassword(email, oldPassword, newPassword),
    'Failed to change password'
  );
};

export const updateOrganizationInfo = async (accountId: string, data: UpdateOrganizationInfo) => {
  return await handleAction(
    async () => await authHandlers.updateOrganizationInfo(accountId, data),
    'Failed to update organization info'
  );
};

export const getAccountSettingsInfo = async () => {
  const user = await getCurrentUser();
  if (!user?.accountId) {
    return null;
  }
  return await handleAction(
    async () => await authHandlers.getAccountSettingsInfo(user?.accountId),
    'Failed to get account settings info'
  );
};

export const checkOrganizationName = async (name: string) => {
  return await handleAction(
    async () => await authHandlers.checkOrganizationName(name),
    'Failed to check organization name'
  );
};

export const updateOrganizationData = async (token: string, data: FormData) => {
  return await handleAction(
    async () => await authHandlers.updateOrganizationData(token, data),
    'Failed to update organization data'
  );
};

export const verifyAndGetOrganizationInfo = async (token: string) => {
  return await handleAction(
    async () => await authHandlers.verifyAndGetOrganizationInfo(token),
    'Failed to verify token and get organization information'
  );
};
