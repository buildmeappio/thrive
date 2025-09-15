import ErrorMessages from '@/constants/ErrorMessages';
import prisma from '@/shared/lib/prisma';
import { getCurrentUser } from '@/shared/utils/imeCreation.utils';
import { HttpError } from '@/utils/httpError';

const acceptOrganization = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw HttpError.unauthorized('User not authenticated');
    }
    const organization = await prisma.organization.findFirst({
      where: {
        deletedAt: null,
        manager: {
          some: {
            account: {
              userId: currentUser.userId,
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

    if (!organization) {
      throw HttpError.notFound(ErrorMessages.ORG_NOT_FOUND);
    }

    if (organization.status === 'ACCEPTED') {
      throw new Error(ErrorMessages.ORG_ALREADY_ACCEPTED);
    }

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        status: 'ACCEPTED',
      },
    });

    return updatedOrganization;
  } catch (error) {
    console.error('Error accepting organization:', error);
    throw HttpError.handleServiceError('Failed to accept organization');
  }
};

const organizationService = {
  acceptOrganization,
};

export default organizationService;
