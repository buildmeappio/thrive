import prisma from '@/shared/lib/prisma';
import type { Organization, Address, User, Account, Department } from '@prisma/client';

export const findOrganizationByName = async (name: string): Promise<Organization | null> => {
  return prisma.organization.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
};

export const findOrganizationByEmail = async (email: string): Promise<Organization | null> => {
  return prisma.organization.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
};

interface CreateOrganizationWithUserData {
  organizationType: string;
  organizationName: string;
  addressLookup: string;
  streetAddress: string;
  aptUnitSuite?: string | null;
  city: string;
  provinceOfResidence: string;
  postalCode: string;
  organizationWebsite?: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  officialEmailAddress: string;
  jobTitle?: string | null;
  department?: string | null;
  agreeTermsConditions: boolean;
  consentSecureDataHandling: boolean;
  authorizedToCreateAccount: boolean;
  hashedPassword: string;
}

export const createOrganizationWithUser = async (data: CreateOrganizationWithUserData) => {
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
        email: officialEmailAddress,
        type: { connect: { id: '290cceb0-dedc-4c33-9801-1e7d4cb443g6' } },
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
    const account = await tx.account.create({
      data: {
        userId: user.id,
        roleId: '290cceb0-dedc-4c33-9801-1e7d4cb116b2',
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

export default {
  findOrganizationByName,
  findOrganizationByEmail,
  createOrganizationWithUser,
};
