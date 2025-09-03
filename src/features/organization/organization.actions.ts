'use server';

import ErrorMessages from '@/constants/ErrorMessages';
import organizationService from './organization.service';
import { type FormData } from '@/store/useOrgRegFormStore';

export const checkOrganizationNameAction = async (name: string): Promise<boolean> => {
  try {
    return await organizationService.checkOrganizationNameService(name);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_CHECK_ORG_NAME;
    console.error(ErrorMessages.FAILED_CHECK_ORG_NAME, error);
    throw new Error(message);
  }
};

export const checkUserEmailAction = async (email: string): Promise<boolean> => {
  try {
    return await organizationService.checkUserEmailService(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_CHECK_ORG_EMAIL;
    console.error(ErrorMessages.FAILED_CHECK_ORG_EMAIL, error);
    throw new Error(message);
  }
};

export const registerOrganizationAction = async (data: FormData) => {
  try {
    return await organizationService.registerOrganizationService(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_REGISTER_ORG;
    console.error(ErrorMessages.FAILED_REGISTER_ORG, error);
    throw new Error(message);
  }
};

export const finalizeOrganizationRegistrationAction = async (data: FormData) => {
  try {
    return await organizationService.finalizeOrganizationRegistrationService(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_FINALIZE_ORG_REG;
    console.error(ErrorMessages.FAILED_FINALIZE_ORG_REG, error);
    throw new Error(message);
  }
};

export const getOrganizationTypeAction = async () => {
  try {
    return await organizationService.getOrganizationTypeService();
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_ORG_TYPE;
    console.error(ErrorMessages.FAILED_GET_ORG_TYPE, error);
    throw new Error(message);
  }
};

export const getDepartmentAction = async () => {
  try {
    return await organizationService.getDepartmentService();
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_DEPARTMENTS;
    console.error(ErrorMessages.FAILED_GET_DEPARTMENTS, error);
    throw new Error(message);
  }
};

export const acceptOrganizationAction = async (id: string) => {
  try {
    return await organizationService.acceptOrganizationService(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_ACCEPT_ORG;
    console.error(ErrorMessages.FAILED_ACCEPT_ORG, error);
    throw new Error(message);
  }
};

export const getOrganizationAction = async (id: string) => {
  try {
    return await organizationService.getOrganizationService(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : ErrorMessages.FAILED_GET_ORG_STATUS;
    console.error(ErrorMessages.FAILED_GET_ORG_STATUS, error);
    throw new Error(message);
  }
};
