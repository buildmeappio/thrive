'use server';
import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { Examination, Prisma, SecureLinkStatus } from '@thrive/database';
import { Roles } from '@/domains/auth/constants/roles';
import { isAllowedRole } from '@/lib/rbac';
import { v4 } from 'uuid';
import logger from '@/utils/logger';

export type ListCasesFilter = {
  assignToUserId?: string;
  caseTypes?: string[];
  statuses?: string[];
};

class CaseService {
  // Get case types based on provided names
  async getCaseTypes(typeNames: string[]) {
    try {
      const types = await prisma.examinationType.findMany({
        where: {
          name: { in: typeNames },
        },
      });

      if (types.length === 0) {
        throw HttpError.notFound('Case type not found');
      }

      return types;
    } catch (error) {
      throw HttpError.fromError(error, 'Failed to get case types');
    }
  }

  // Check if the case belongs to the user
  async doesCaseBelongToUser(exam: Examination, userId: string) {
    const user = await prisma.account.findFirst({
      where: { userId },
      include: { role: true },
    });

    if (!user) throw HttpError.notFound('User not found');

    if (user.role.name === Roles.SUPER_ADMIN) return true;

    if (exam.assignToId !== user.id) {
      throw HttpError.notFound('Case does not belong to user');
    }

    return true;
  }

  // Retrieve a user's assignable account ID based on their roles
  async getAssignTo(userId: string) {
    logger.log('userId', userId);

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: { role: true },
    });

    logger.log('roles', accounts);
    const isInvalidRole = accounts.some(account => !isAllowedRole(account.role.name));

    logger.log('isInvalidRole', isInvalidRole);

    if (accounts.length === 0 || isInvalidRole) {
      throw HttpError.badRequest('Invalid role');
    }

    const isSuperAdmin = accounts.some(account => account.role.name === Roles.SUPER_ADMIN);
    if (isSuperAdmin) {
      return undefined;
    }

    const account = accounts.find(
      account => account.role.name === Roles.STAFF || account.role.name === Roles.ADMIN
    );

    if (!account) {
      throw HttpError.badRequest('No account found');
    }
    return account.id;
  }

  // Get the statuses for case types
  async getStatuses() {
    try {
      const statuses = await prisma.caseStatus.findMany();

      if (statuses.length === 0) {
        throw HttpError.notFound('Status not found');
      }

      return statuses;
    } catch (error) {
      throw HttpError.fromError(error, 'Failed to get statuses');
    }
  }

  // Convert filter object to a Prisma `where` clause
  async convertFilterToWhere(filter?: ListCasesFilter) {
    const where: Prisma.ExaminationWhereInput = {};

    if (filter?.assignToUserId) {
      const assignToId = await this.getAssignTo(filter.assignToUserId);
      where.assignToId = assignToId;
    }

    if (filter?.caseTypes) {
      const _types = await this.getCaseTypes(filter.caseTypes);
      // where.caseTypeId = {
      //   in: _types.map((t) => t.id),
      // };
    }

    if (filter?.statuses) {
      const statuses = await this.getStatuses();
      where.statusId = {
        in: statuses.map(status => status.id),
      };
    }

    return where;
  }

  // Get case by ID
  async listCases(assignToId?: string) {
    try {
      const cases = await prisma.examination.findMany({
        where: {
          ...(assignToId ? { assignToId } : {}),
          case: {
            deletedAt: null,
            isDraft: false,
          },
        },
        include: {
          examiner: { include: { user: true } },
          examinationType: true,
          status: true,
          claimant: { include: { address: true } },
          legalRepresentative: { include: { address: true } },
          insurance: { include: { address: true } },
          services: {
            include: {
              interpreter: { include: { language: true } },
              transport: { include: { pickupAddress: true } },
            },
          },
          case: {
            include: {
              caseType: true,
              documents: { include: { document: true } },
              organization: {
                include: {
                  manager: {
                    where: {
                      deletedAt: null,
                      account: {
                        user: {
                          userType: 'ORGANIZATION_USER',
                          organizationId: { not: null },
                        },
                      },
                    },
                    include: {
                      account: {
                        include: {
                          user: true, // Include user to get email, firstName, lastName
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      logger.log('list cases', cases);
      return cases;
    } catch (error) {
      logger.log('list cases', error);
      throw HttpError.fromError(error, 'Failed to list cases');
    }
  }

  async getCaseById(id: string) {
    try {
      const caseItem = await prisma.examination.findUnique({
        where: { id },
        include: {
          examiner: { include: { user: true } }, // Include examiner details
          examinationType: true, // Include examination type
          status: true,
          claimant: { include: { address: true } }, // Include claimant details
          legalRepresentative: { include: { address: true } }, // Include legal representative
          insurance: { include: { address: true } }, // Include insurance
          services: {
            include: {
              interpreter: { include: { language: true } }, // Include interpreter language
              transport: { include: { pickupAddress: true } }, // Include transport details
            },
          },
          claimantBookings: {
            include: {
              reports: {
                where: {
                  deletedAt: null,
                  status: {
                    in: ['SUBMITTED', 'APPROVED', 'REJECTED', 'REVIEWED'],
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1, // Get the most recent report
              },
            },
          },
          case: {
            include: {
              caseType: true, // Include case type
              documents: { include: { document: true } }, // Include documents
              organization: {
                include: {
                  manager: {
                    where: {
                      deletedAt: null,
                      account: {
                        user: {
                          userType: 'ORGANIZATION_USER',
                          organizationId: { not: null },
                        },
                      },
                    },
                    include: {
                      account: {
                        include: {
                          user: true, // Include user to get email, firstName, lastName
                        },
                      },
                    },
                  },
                },
              }, // Include organization with manager details
            },
          },
        },
      });

      if (!caseItem) {
        throw HttpError.notFound('Case not found');
      }

      return caseItem;
    } catch (error) {
      throw HttpError.fromError(error, 'Failed to get case');
    }
  }

  // Update case status
  async updateStatus(caseId: string, status: string) {
    try {
      const statusItem = await prisma.caseStatus.findFirst({
        where: { name: status },
      });
      if (!statusItem) {
        throw HttpError.notFound('Status not found');
      }

      const exam = await prisma.examination.update({
        where: { id: caseId },
        data: { statusId: statusItem.id },
      });

      return exam;
    } catch (error) {
      throw HttpError.fromError(error, 'Failed to update status');
    }
  }

  // Generate a secure link for the case
  async generateSecureLink(caseId: string) {
    try {
      const exam = await prisma.examination.findUnique({
        where: { id: caseId },
      });

      if (!exam) {
        throw HttpError.notFound('Case not found');
      }

      const token = v4();
      // Link expires in 7 days (168 hours)
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

      const secureLink = await prisma.secureLink.create({
        data: {
          token,
          expiresAt,
          status: SecureLinkStatus.PENDING,
          lastOpenedAt: null,
          submittedAt: null,
        },
      });

      await prisma.examinationSecureLink.create({
        data: {
          examinationId: caseId,
          secureLinkId: secureLink.id,
        },
      });

      return `${process.env.NEXT_PUBLIC_APP_URL}/claimant/availability/${token}`;
    } catch (error) {
      throw HttpError.fromError(error, 'Failed to generate secure link');
    }
  }
}

const caseService = new CaseService();

export async function getCaseTypes(typeNames: string[]) {
  return await caseService.getCaseTypes(typeNames);
}

export async function doesCaseBelongToUser(exam: Examination, userId: string) {
  return await caseService.doesCaseBelongToUser(exam, userId);
}

export async function getAssignTo(userId: string) {
  return await caseService.getAssignTo(userId);
}

export async function getStatuses() {
  return await caseService.getStatuses();
}

export async function convertFilterToWhere(filter?: ListCasesFilter) {
  return await caseService.convertFilterToWhere(filter);
}

export async function listCases(assignToId?: string) {
  return await caseService.listCases(assignToId);
}

export async function getCaseById(id: string) {
  return await caseService.getCaseById(id);
}

export async function updateStatus(caseId: string, status: string) {
  return await caseService.updateStatus(caseId, status);
}

export async function generateSecureLink(caseId: string) {
  return await caseService.generateSecureLink(caseId);
}
