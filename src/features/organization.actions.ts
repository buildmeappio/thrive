'use server';

import ErrorMessages from '@/constants/ErrorMessages';
import { type FormData } from '@/store/useRegistrationStore';
import { getServerSession } from 'next-auth';
import type { IMEFormData } from '@/store/useIMEReferralStore';
import handler from './organization.handler';

export const checkOrganizationNameAction = async (name: string): Promise<boolean> => {
  try {
    return await handler.checkOrganizationName(name);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_CHECK_ORG_NAME;
    console.error(ErrorMessages.FAILED_CHECK_ORG_NAME, error);
    throw new Error(message);
  }
};

export const checkUserEmailAction = async (email: string): Promise<boolean> => {
  try {
    return await handler.checkUserEmail(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_CHECK_ORG_EMAIL;
    console.error(ErrorMessages.FAILED_CHECK_ORG_EMAIL, error);
    throw new Error(message);
  }
};

export const registerOrganizationAction = async (data: FormData) => {
  try {
    return await handler.registerOrganization(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_REGISTER_ORG;
    console.error(ErrorMessages.FAILED_REGISTER_ORG, error);
    throw new Error(message);
  }
};

export const finalizeOrganizationRegistrationAction = async (data: FormData) => {
  try {
    return await handler.finalizeOrganizationRegistration(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_FINALIZE_ORG_REG;
    console.error(ErrorMessages.FAILED_FINALIZE_ORG_REG, error);
    throw new Error(message);
  }
};

export const getOrganizationTypeAction = async () => {
  try {
    return await handler.getOrganizationType();
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_ORG_TYPE;
    console.error(ErrorMessages.FAILED_GET_ORG_TYPE, error);
    throw new Error(message);
  }
};

export const getDepartmentAction = async () => {
  try {
    return await handler.getDepartment();
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_DEPARTMENTS;
    console.error(ErrorMessages.FAILED_GET_DEPARTMENTS, error);
    throw new Error(message);
  }
};

export const acceptOrganizationAction = async () => {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }
    return await handler.acceptOrganization(session.user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_ACCEPT_ORG;
    console.error(ErrorMessages.FAILED_ACCEPT_ORG, error);
    throw new Error(message);
  }
};

export const getOrganizationAction = async () => {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }
    return await handler.getOrganization(session.user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_ORG_STATUS;
    console.error(ErrorMessages.FAILED_GET_ORG_STATUS, error);
    throw new Error(message);
  }
};

export const getCaseTypeAction = async () => {
  try {
    return await handler.getCaseType();
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_CASE_TYPE;
    console.error(ErrorMessages.FAILED_GET_CASE_TYPE, error);
    throw new Error(message);
  }
};

export const getExamFormatAction = async () => {
  try {
    return await handler.getExamFormat();
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_EXAM_FORMAT;
    console.error(ErrorMessages.FAILED_GET_EXAM_FORMAT, error);
    throw new Error(message);
  }
};

export const getRequestedSpecialtyAction = async () => {
  try {
    return await handler.getRequestedSpecialty();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ErrorMessages.FAILED_GET_REQUESTED_SPECIALTY;
    console.error(ErrorMessages.FAILED_GET_REQUESTED_SPECIALTY, error);
    throw new Error(message);
  }
};

export const createIMEReferralAction = async (data: IMEFormData) => {
  try {
    return await handler.createIMEReferral(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ErrorMessages.FAILED_CREATE_IME_REFERRAL;
    console.error(ErrorMessages.FAILED_CREATE_IME_REFERRAL, error);
    throw new Error(message);
  }
};
