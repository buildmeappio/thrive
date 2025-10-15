import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import bcrypt from 'bcryptjs';
import { type CreateOrganizationWithUserData } from '../types/createOrganization';
import { Roles } from '@/constants/role';
import { getCurrentUser } from './session';
import emailService from '@/services/emailService';
import {
  signOtpToken,
  signPasswordToken,
  verifyResetPasswordToken,
  signResetPasswordToken,
} from '@/lib/jwt';
import ErrorMessages from '@/constants/ErrorMessages';
import jwt from 'jsonwebtoken';
import SuccessMessages from '@/constants/SuccessMessages';
import { Prisma } from '@prisma/client';

const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: {
        accounts: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw HttpError.notFound('User not found');
    }

    return user;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get user by email');
  }
};

const checkPassword = async (password: string, hashedPassword: string) => {
  try {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      throw HttpError.unauthorized('Invalid password');
    }

    return isPasswordValid;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to check password');
  }
};

const createOrganizationWithUser = async (data: CreateOrganizationWithUserData) => {
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const {
      organizationType,
      organizationName,
      addressLookup,
      streetAddress,
      aptUnitSuite,
      city,
      provinceOfResidence,
      postalCode,
      organizationWebsite,
      firstName,
      lastName,
      phoneNumber,
      officialEmailAddress,
      jobTitle,
      department,
      agreeTermsConditions,
      consentSecureDataHandling,
      authorizedToCreateAccount,
    } = data;

    // Address
    const address = await tx.address.create({
      data: {
        address: addressLookup,
        street: streetAddress,
        suite: aptUnitSuite ?? '',
        city,
        province: provinceOfResidence,
        postalCode,
      },
    });

    // Organization
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        website: organizationWebsite,
        type: { connect: { id: organizationType } },
        address: { connect: { id: address.id } },
        agreeToTermsAndPrivacy: agreeTermsConditions,
        dataSharingConsent: consentSecureDataHandling,
        isAuthorized: authorizedToCreateAccount,
      },
    });

    // User
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email: officialEmailAddress,
        phone: phoneNumber,
      },
    });

    // Department
    let departmentId: string | null = null;
    if (department) {
      const dept = await tx.department.upsert({
        where: { id: department },
        create: { name: department },
        update: {},
      });
      departmentId = dept.id;
    }

    // Role
    const orgManagerRole = await tx.role.findFirst({
      where: { name: Roles.ORGANIZATION_MANAGER },
    });

    if (!orgManagerRole) {
      throw new Error('Organization Manager role not found');
    }

    // Account
    const account = await tx.account.create({
      data: {
        userId: user.id,
        roleId: orgManagerRole.id,
      },
    });

    // Organization Manager
    await tx.organizationManager.create({
      data: {
        organizationId: organization.id,
        accountId: account.id,
        jobTitle,
        departmentId,
      },
    });

    return {
      organizationId: organization.id,
      userId: user.id,
      accountId: account.id,
      email: user.email,
      firstName,
      lastName,
    };
  });

  try {
    await emailService.sendEmail(
      'Welcome to Our Platform!',
      'welcome.html',
      {
        firstName: result.firstName,
        lastName: result.lastName,
        cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
      },
      result.email
    );
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }

  return result;
};

const getDepartments = async () => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        deletedAt: null,
      },
    });
    if (!departments) {
      throw HttpError.notFound('Departments not found');
    }
    return departments;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get departments');
  }
};

const getOrganizationTypes = async () => {
  try {
    const organizationTypes = await prisma.organizationType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
    if (!organizationTypes) {
      throw HttpError.notFound('Organization types not found');
    }
    return organizationTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get organization types');
  }
};

const getOrganization = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw HttpError.unauthorized('User not authenticated');

    const organizationManager = await prisma.organizationManager.findFirst({
      where: {
        account: {
          userId: currentUser.id,
        },
        deletedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!organizationManager) throw HttpError.notFound('Organization not found');

    return organizationManager.organization;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get organization');
  }
};

const getExaminationTypes = async () => {
  try {
    const examinationTypes = await prisma.examinationType.findMany({
      where: {
        deletedAt: null,
      },
    });
    if (!examinationTypes) throw HttpError.notFound('Examination types not found');
    return examinationTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get examination types');
  }
};

const sendOtp = async (email: string) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const token = signOtpToken({ email, otp }, '5m');

  await emailService.sendEmail(
    'Welcome to Our Platform!',
    'otp.html',
    {
      otp: otp,
      cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
    },
    email
  );

  return { token };
};

const verifyOtp = (otp: string, email: string, token: string) => {
  try {
    if (!token) {
      return { success: false, message: 'No OTP token found' };
    }
    if (!process.env.JWT_OTP_SECRET) {
      throw new Error(ErrorMessages.JWT_SECRETS_REQUIRED);
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_OTP_SECRET) as { email: string; otp: string };

    // Compare OTP
    if (decoded.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    if (decoded.email !== email) {
      return { success: false, message: 'Email mismatch' };
    }

    // Create password token with email
    const passwordToken = signPasswordToken({ email });

    return { success: true, email: decoded.email, passwordToken };
  } catch (err) {
    console.error('OTP verification error:', err);
    return { success: false, message: 'OTP verification failed' };
  }
};

const checkUserByEmail = async (email: string) => {
  try {
    if (!email) return false;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
    return !!user;
  } catch (error) {
    console.error('Check user by email error:', error);
    return { success: false, message: 'Check user by email failed' };
  }
};

const createPassword = async (email: string, password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: { id: true, email: true },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, message: 'Update password failed' };
  }
};

const sendResetPasswordLink = async (email: string) => {
  try {
    const isUserExists = await prisma.user.findUnique({
      where: {
        email: email,
        deletedAt: null,
      },
      select: {
        email: true,
      },
    });
    if (!isUserExists) {
      throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
    }
    if (email.toLowerCase().trim() !== isUserExists.email.toLowerCase().trim()) {
      throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // Sign the token with user email
    const token = signResetPasswordToken({ email: email });

    const resetLink = `${process.env.FRONTEND_URL}/organization/password/reset?token=${token}`;

    await emailService.sendEmail(
      'Reset your password - Thrive',
      'reset-link.html',
      {
        resetLink: resetLink,
        cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
      },
      email
    );
  } catch (error) {
    console.error(ErrorMessages.ERROR_SENDING_RESET_LINK, error);
    return { success: false, message: ErrorMessages.ERROR_SENDING_RESET_LINK };
  }
};

const verifyResetToken = async (token: string) => {
  try {
    const decoded = verifyResetPasswordToken(token);

    if (!decoded || !decoded.email) {
      return { success: false, message: ErrorMessages.INVALID_OR_EXPIRED_TOKEN };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
        deletedAt: null,
      },
      select: {
        email: true,
      },
    });

    if (!user) {
      return { success: false, message: ErrorMessages.USER_NOT_FOUND };
    }

    return { success: true, email: decoded.email };
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return { success: false, message: ErrorMessages.ERROR_VERIFYING_TOKEN };
  }
};

const resetPassword = async (token: string, password: string) => {
  try {
    const decoded = verifyResetPasswordToken(token);

    if (!decoded || !decoded.email) {
      return { success: false, message: ErrorMessages.INVALID_OR_EXPIRED_TOKEN };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return { success: false, message: ErrorMessages.USER_NOT_FOUND };
    }

    if (decoded.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      return { success: false, message: ErrorMessages.UNAUTHORIZED };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: SuccessMessages.PASSWORD_RESET_SUCCESS };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: ErrorMessages.ERROR_RESETTING_PASSWORD };
  }
};

const authService = {
  getUserByEmail,
  checkPassword,
  createOrganizationWithUser,
  getOrganizationTypes,
  getDepartments,
  getOrganization,
  getExaminationTypes,
  sendOtp,
  verifyOtp,
  checkUserByEmail,
  createPassword,
  sendResetPasswordLink,
  verifyResetToken,
  resetPassword,
};

export default authService;
