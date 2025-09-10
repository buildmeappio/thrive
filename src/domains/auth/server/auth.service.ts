import prisma from '@/shared/lib/prisma';
import { HttpError } from '@/utils/httpError';
import bcrypt from 'bcryptjs';
import { type CreateOrganizationWithUserData } from '../types/createOrganization';
import { Roles } from '@/constants/role';
import { getCurrentUser } from './session';
import emailService from '@/shared/lib/emailService';
import { signOtpToken, signPasswordToken } from '@/lib/jwt';
import ErrorMessages from '@/constants/ErrorMessages';
import jwt from 'jsonwebtoken';

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

const getOrganizationByName = async (name: string) => {
  try {
    const org = await prisma.organization.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!org) {
      throw HttpError.notFound('Organization not found');
    }
    return org;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get organization by name');
  }
};

const createOrganizationWithUser = async (data: CreateOrganizationWithUserData) => {
  return prisma.$transaction(async tx => {
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
      hashedPassword,
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
        password: hashedPassword,
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

    // Account
    const orgManagerRole = await tx.role.findFirst({
      where: { name: Roles.ORGANIZATION_MANAGER },
    });

    if (!orgManagerRole) {
      throw new Error('Organization Manager role not found');
    }

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

    return { organizationId: organization.id, userId: user.id, accountId: account.id };
  });
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

const getCaseTypes = async () => {
  try {
    const caseTypes = await prisma.caseType.findMany({
      where: {
        deletedAt: null,
      },
    });
    if (!caseTypes) throw HttpError.notFound('Case types not found');
    return caseTypes;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get case types');
  }
};

const getExamFormats = async () => {
  try {
    const examFormats = await prisma.examFormat.findMany({
      where: {
        deletedAt: null,
      },
    });
    if (!examFormats) throw HttpError.notFound('Exam formats not found');
    return examFormats;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get exam formats');
  }
};

const getRequestedSpecialties = async () => {
  try {
    const requestedSpecialties = await prisma.requestedSpecialty.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
    if (!requestedSpecialties) throw HttpError.notFound('Requested specialties not found');
    return requestedSpecialties;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get requested specialties');
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
    if (!process.env.JWT_SECRET) {
      throw new Error(ErrorMessages.JWT_SECRETS_REQUIRED);
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { email: string; otp: string };

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

const authService = {
  getUserByEmail,
  checkPassword,
  getOrganizationByName,
  createOrganizationWithUser,
  getOrganizationTypes,
  getDepartments,
  getOrganization,
  getCaseTypes,
  getExamFormats,
  getRequestedSpecialties,
  sendOtp,
  verifyOtp,
};

export default authService;
