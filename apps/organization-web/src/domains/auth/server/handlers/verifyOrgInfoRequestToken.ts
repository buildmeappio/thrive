'use server';
import { verifyOrgInfoRequestToken } from '@/lib/jwt';
import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

/**
 * Verifies the organization info request token and returns organization details
 * This is used to pre-fill the form when organization updates their info
 */
const verifyAndGetOrganizationInfo = async (token: string) => {
  try {
    // Verify token
    const payload = verifyOrgInfoRequestToken(token);
    if (!payload?.email || !payload?.organizationId) {
      throw HttpError.badRequest(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: payload.organizationId },
      include: {
        address: true,
        type: true,
        manager: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
            department: true,
          },
        },
      },
    });

    if (!organization) {
      throw HttpError.notFound('Organization not found');
    }

    const manager = organization.manager[0];
    if (!manager || !manager.account || !manager.account.user) {
      throw HttpError.notFound('Organization manager not found');
    }

    const user = manager.account.user;

    // Return organization data in the format expected by the registration form
    return {
      step1: {
        organizationType: organization.typeId,
        organizationName: organization.name,
        addressLookup: organization.address.address,
        streetAddress: organization.address.street,
        aptUnitSuite: organization.address.suite,
        city: organization.address.city,
        provinceOfResidence: organization.address.province,
        postalCode: organization.address.postalCode,
        organizationWebsite: organization.website || '',
      },
      step2: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phone || '',
        officialEmailAddress: user.email,
        jobTitle: manager.jobTitle || '',
        department: manager.departmentId || '',
      },
      step3: {
        agreeTermsConditions: organization.agreeToTermsAndPrivacy,
        consentSecureDataHandling: organization.dataSharingConsent,
        authorizedToCreateAccount: organization.isAuthorized,
      },
    };
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to verify token and get organization info');
  }
};

export default verifyAndGetOrganizationInfo;
