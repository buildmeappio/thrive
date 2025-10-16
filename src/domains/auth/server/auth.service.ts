import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import bcrypt from 'bcryptjs';
import { type CreateOrganizationWithUserData } from '../types/createOrganization';
import { Roles } from '@/constants/role';
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
      throw HttpError.notFound('Organization Manager role not found');
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
    const emailResult = await emailService.sendEmail(
      'Welcome to Our Platform!',
      'welcome.html',
      {
        firstName: result.firstName,
        lastName: result.lastName,
        cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
      },
      result.email
    );

    if (!emailResult.success) {
      throw HttpError.internal(emailResult.error);
    }

    return result;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to send welcome email');
  }
};

const getDepartments = async () => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        deletedAt: null,
      },
    });
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

    return organizationTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get organization types');
  }
};

const getOrganization = async (userId: string) => {
  try {
    const organizationManager = await prisma.organizationManager.findFirst({
      where: {
        account: {
          userId: userId,
        },
        deletedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!organizationManager || !organizationManager.organization) {
      throw HttpError.notFound('Organization not found');
    }

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
      orderBy: {
        name: 'asc',
      },
    });

    return examinationTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get examination types');
  }
};

const generateOtpToken = (email: string, otp: string) => {
  try {
    const token = signOtpToken({ email, otp }, '5m');
    return token;
  } catch (error) {
    console.error('Failed to generate OTP token:', error);
    throw HttpError.badRequest('Failed to generate OTP token');
  }
};

const sendOtp = async (email: string) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const token = generateOtpToken(email, otp);

    const payload = {
      email: email,
      otp: otp,
    };

    const result = await emailService.sendEmail(
      'Welcome to Our Platform!',
      'otp.html',
      payload,
      email
    );

    if (!result.success) {
      throw HttpError.internal(result.error);
    }

    return token;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to send OTP');
  }
};

const verifyOtp = (otp: string, email: string, token: string) => {
  try {
    if (!token) {
      throw HttpError.badRequest('No OTP token found');
    }

    if (!process.env.JWT_OTP_SECRET) {
      throw HttpError.badRequest(ErrorMessages.JWT_SECRETS_REQUIRED);
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_OTP_SECRET) as { email: string; otp: string };

    // Compare OTP
    if (decoded.otp !== otp) {
      throw HttpError.badRequest('Invalid OTP');
    }

    if (decoded.email !== email) {
      throw HttpError.badRequest('Email mismatch');
    }

    // Create password token with email
    const passwordToken = signPasswordToken({ email });

    return { email: decoded.email, passwordToken };
  } catch (err) {
    throw HttpError.handleServiceError(err, 'OTP verification failed');
  }
};

const checkUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
    return !!user;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to check user by email');
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
    return updatedUser;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to create password');
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
      throw HttpError.unauthorized(ErrorMessages.UNAUTHORIZED);
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
    throw HttpError.handleServiceError(error, ErrorMessages.ERROR_SENDING_RESET_LINK);
  }
};

const verifyResetToken = async (token: string) => {
  try {
    const decoded = verifyResetPasswordToken(token);

    if (!decoded || !decoded.email) {
      throw HttpError.badRequest(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
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
      throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
    }

    return user.email;
  } catch (error) {
    throw HttpError.handleServiceError(error, ErrorMessages.ERROR_VERIFYING_TOKEN);
  }
};

const resetPassword = async (token: string, password: string) => {
  try {
    const decoded = verifyResetPasswordToken(token);

    if (!decoded || !decoded.email) {
      throw HttpError.badRequest(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
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
      throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
    }

    if (decoded.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      throw HttpError.unauthorized(ErrorMessages.UNAUTHORIZED);
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

    return SuccessMessages.PASSWORD_RESET_SUCCESS;
  } catch (error) {
    throw HttpError.handleServiceError(error, ErrorMessages.ERROR_RESETTING_PASSWORD);
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
