import ErrorMessages from '@/constants/ErrorMessages';
import prisma from '@/shared/lib/prisma';
import { getCurrentUser, saveFileToStorage } from '@/shared/utils/imeCreation.utils';
import {
  type Organization,
  type Department,
  type OrganizationType,
  type CaseType,
  type User,
  type ExamFormat,
  type RequestedSpecialty,
} from '@prisma/client';

export const findOrganizationByName = async (name: string): Promise<Organization | null> => {
  return prisma.organization.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findFirst({
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
      where: { name: 'organization-manager' },
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

const getOrganizationType = async (): Promise<OrganizationType[]> => {
  return prisma.organizationType.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const getDepartments = async (): Promise<Department[]> => {
  return prisma.department.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const acceptOrganization = async (userId: string) => {
  const organization = await prisma.organization.findFirst({
    where: {
      deletedAt: null,
      manager: {
        some: {
          account: {
            userId,
          },
        },
      },
    },
    include: {
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

  if (!organization) throw new Error(ErrorMessages.ORG_NOT_FOUND);

  // if (organization.status === 'ACCEPTED') {
  //   throw new Error(ErrorMessages.ORG_ALREADY_ACCEPTED);
  // }

  const updatedOrganization = await prisma.organization.update({
    where: {
      id: organization.id,
    },
    data: {
      status: 'ACCEPTED',
    },
  });

  return updatedOrganization;
};

const getOrganization = async (id: string): Promise<Organization> => {
  const organization = await prisma.organization.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!organization) throw new Error(ErrorMessages.ORG_NOT_FOUND);

  return organization;
};

const getCaseType = async (): Promise<CaseType[]> => {
  return prisma.caseType.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const getExamFormat = async (): Promise<ExamFormat[]> => {
  return prisma.examFormat.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const getRequestedSpecialty = async (): Promise<RequestedSpecialty[]> => {
  return prisma.requestedSpecialty.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

interface CreateIMEReferralData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  addressLookup: string;
  street?: string;
  apt?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  reason: string;
  caseType: string;
  urgencyLevel: string;
  examFormat: string;
  requestedSpecialty: string;
  preferredLocation: string;
  files: File[];
  consentConfirmation: boolean;
}

export const createIMEReferralWithClaimant = async (data: CreateIMEReferralData) => {
  return prisma.$transaction(async tx => {
    const address = await tx.address.create({
      data: {
        address: data.addressLookup,
        street: data.street || '',
        suite: data.apt || '',
        city: data.city || '',
        province: data.province || '',
        postalCode: data.postalCode || '',
      },
    });

    const claimant = await tx.claimant.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dob),
        gender: data.gender,
        phoneNumber: data.phone,
        emailAddress: data.email,
        addressId: address.id,
      },
    });

    const caseNumber = `IME-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const organizationManager = await tx.organizationManager.findFirst({
      where: {
        accountId: currentUser.accountId,
      },
    });

    async function normalizeRelation(table: any, value: string) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(value)) {
        return { connect: { id: value } };
      }

      let record = await table.findFirst({ where: { name: value } });

      if (!record) {
        record = await table.findFirst({
          where: { name: { equals: value.replace(/_/g, ' '), mode: 'insensitive' } },
        });
      }

      if (!record) {
        const existing = await table.findMany({ select: { id: true, name: true } });
        console.error(`❌ Invalid relation value: ${value}. Available:`, existing);
        throw new Error(`Invalid relation value: ${value}`);
      }

      return { connect: { id: record.id } };
    }

    const caseTypeRelation = await normalizeRelation(tx.caseType, data.caseType);
    const examFormatRelation = await normalizeRelation(tx.examFormat, data.examFormat);
    const requestedSpecialtyRelation = await normalizeRelation(
      tx.requestedSpecialty,
      data.requestedSpecialty
    );

    const imeReferral = await tx.iMEReferral.create({
      data: {
        caseNumber,
        examiner: { connect: { id: currentUser.accountId! } },
        organization: organizationManager?.organizationId
          ? { connect: { id: organizationManager.organizationId } }
          : undefined,
        claimant: { connect: { id: claimant.id } },

        caseType: caseTypeRelation,
        examFormat: examFormatRelation,
        requestedSpecialty: requestedSpecialtyRelation,

        reasonForReferral: data.reason,
        bodyPartConcern: data.urgencyLevel,
        preferredLocation: data.preferredLocation,
      },
    });

    const documentIds: string[] = [];
    for (const file of data.files) {
      await saveFileToStorage(file);

      const document = await tx.documents.create({
        data: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
      });

      await tx.referralDocument.create({
        data: {
          referralId: imeReferral.id,
          documentId: document.id,
        },
      });

      documentIds.push(document.id);
    }

    return {
      referralId: imeReferral.id,
      claimantId: claimant.id,
      caseNumber,
      documentIds,
    };
  });
};

const service = {
  findOrganizationByName,
  findUserByEmail,
  createOrganizationWithUser,
  getOrganizationType,
  getDepartments,
  acceptOrganization,
  getOrganization,
  getCaseType,
  getExamFormat,
  getRequestedSpecialty,
  createIMEReferralWithClaimant,
};
export default service;
