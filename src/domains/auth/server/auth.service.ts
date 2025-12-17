import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import bcrypt from 'bcryptjs';
import { type CreateOrganizationWithUserData } from '../types/createOrganization';
import { type UpdateOrganizationData } from '../types/updateOrganizationData';
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
import { getE164PhoneNumber } from '@/utils/formatNumbers';
import env from '@/config/env';

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
        phone: getE164PhoneNumber(phoneNumber),
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
        cdnUrl: env.NEXT_PUBLIC_CDN_URL,
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
    const examinationTypes = await prisma.caseType.findMany({
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
      cdnUrl: env.NEXT_PUBLIC_CDN_URL,
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

    if (!env.JWT_OTP_SECRET) {
      throw HttpError.badRequest(ErrorMessages.JWT_SECRETS_REQUIRED);
    }

    // Verify JWT
    const decoded = jwt.verify(token, env.JWT_OTP_SECRET) as { email: string; otp: string };

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
        email,
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

    const resetLink = `${env.NEXT_PUBLIC_APP_URL}/organization/password/reset?token=${token}`;

    await emailService.sendEmail(
      'Reset your password - Thrive',
      'reset-link.html',
      {
        resetLink: resetLink,
        cdnUrl: env.NEXT_PUBLIC_CDN_URL,
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

const changePassword = async (email: string, newPassword: string, oldPassword: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
    }

    if (email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      throw HttpError.unauthorized(ErrorMessages.UNAUTHORIZED);
    }

    if (!user.password) {
      throw HttpError.badRequest(ErrorMessages.PASSWORD_NOT_SET);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw HttpError.unauthorized(ErrorMessages.INCORRECT_OLD_PASSWORD);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw HttpError.badRequest(ErrorMessages.SAME_PASSWORD);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return SuccessMessages.PASSWORD_CHANGED_SUCCESS;
  } catch (error) {
    throw HttpError.handleServiceError(error, ErrorMessages.ERROR_CHANGING_PASSWORD);
  }
};

const updateOrganizationInfo = async (
  accountId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    organizationName?: string;
    website?: string;
    organizationTypeId?: string;
  }
) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      user: true,
      managers: {
        include: {
          organization: true,
        },
      },
    },
  });

  console.log('account id', accountId);

  if (!account) {
    throw new Error('Account not found');
  }

  const userUpdatePromise = prisma.user.update({
    where: { id: account.userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
    },
  });

  const organizationUpdatePromises = account.managers.map(manager =>
    prisma.organization.update({
      where: { id: manager.organizationId },
      data: {
        ...(data.organizationName && { name: data.organizationName }),
        ...(data.website && { website: data.website }),
        ...(data.organizationTypeId && { typeId: data.organizationTypeId }),
      },
    })
  );

  const results = await prisma.$transaction([userUpdatePromise, ...organizationUpdatePromises]);

  return results;
};

const getAccountSettingsInfo = async (accountId: string) => {
  const accountData = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      managers: {
        where: {
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              name: true,
              website: true,
              type: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return accountData;
};

const checkOrganizationExistsByName = async (name: string): Promise<boolean> => {
  if (!name?.trim()) return false;

  const org = await prisma.organization.findFirst({
    where: { name: { equals: name.trim(), mode: 'insensitive' } },
  });

  return !!org;
};

const updateOrganizationData = async (organizationId: string, data: UpdateOrganizationData) => {
  try {
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

      // Get existing organization with related data
      const existingOrg = await tx.organization.findUnique({
        where: { id: organizationId },
        include: {
          address: true,
          manager: {
            include: {
              account: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!existingOrg) {
        throw HttpError.notFound('Organization not found');
      }

      // Update Address
      await tx.address.update({
        where: { id: existingOrg.addressId },
        data: {
          address: addressLookup,
          street: streetAddress,
          suite: aptUnitSuite ?? '',
          city,
          province: provinceOfResidence,
          postalCode,
        },
      });

      // Update Organization
      await tx.organization.update({
        where: { id: organizationId },
        data: {
          name: organizationName,
          website: organizationWebsite,
          typeId: organizationType,
          agreeToTermsAndPrivacy: agreeTermsConditions,
          dataSharingConsent: consentSecureDataHandling,
          isAuthorized: authorizedToCreateAccount,
          status: 'PENDING', // Reset status to PENDING after update
        },
      });

      // Get the first manager (organization contact person)
      const manager = existingOrg.manager[0];
      if (!manager) {
        throw HttpError.notFound('Organization manager not found');
      }

      // Update User information
      await tx.user.update({
        where: { id: manager.account.userId },
        data: {
          firstName,
          lastName,
          email: officialEmailAddress,
          phone: getE164PhoneNumber(phoneNumber),
        },
      });

      // Update Department if provided
      if (department) {
        const dept = await tx.department.upsert({
          where: { id: department },
          create: { name: department },
          update: {},
        });

        await tx.organizationManager.update({
          where: { id: manager.id },
          data: {
            jobTitle,
            departmentId: dept.id,
          },
        });
      } else {
        await tx.organizationManager.update({
          where: { id: manager.id },
          data: {
            jobTitle,
          },
        });
      }

      return {
        organizationId: existingOrg.id,
        userId: manager.account.userId,
        accountId: manager.accountId,
        email: officialEmailAddress,
        firstName,
        lastName,
      };
    });

    return result;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to update organization data');
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
  changePassword,
  updateOrganizationInfo,
  getAccountSettingsInfo,
  checkOrganizationExistsByName,
  updateOrganizationData,
};

export default authService;
