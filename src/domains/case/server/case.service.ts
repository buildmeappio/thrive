import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import { Examination, Prisma, ExaminationSecureLinkStatus } from "@prisma/client";
import { Roles } from "@/domains/auth/constants/roles";
import { isAllowedRole } from "@/lib/rbac";
import { v4 } from "uuid";

export type ListCasesFilter = {
  assignToUserId?: string | undefined;
  caseTypes?: string[] | undefined; // keep naming as caseTypes
  statuses?: string[] | undefined;
};

class CaseService {
  async getCaseTypes(typeNames: string[]) {
    try {
      const types = await prisma.examinationType.findMany({
        where: {
          name: { in: typeNames },
        },
      });

      if (types.length === 0) {
        throw HttpError.notFound("Case type not found");
      }

      return types;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get case types");
    }
  }

  async doesCaseBelongToUser(exam: Examination, userId: string) {
    const user = await prisma.account.findFirst({
      where: { userId },
      include: { role: true },
    });

    if (!user) throw HttpError.notFound("User not found");

    if (user.role.name === Roles.SUPER_ADMIN) return true;

    if (exam.assignToId !== user.id) {
      throw HttpError.notFound("Case does not belong to user");
    }

    return true;
  }

  async getAssignTo(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      include: { role: true },
    });

    const isInvalidRole = accounts.some(
      (account) => !isAllowedRole(account.role.name)
    );
    if (accounts.length === 0 || isInvalidRole) {
      throw HttpError.badRequest("Invalid role");
    }

    const isSuperAdmin = accounts.some(
      (account) => account.role.name === Roles.SUPER_ADMIN
    );
    if (isSuperAdmin) {
      return undefined;
    }

    const account = accounts.find(
      (account) =>
        account.role.name == Roles.STAFF || account.role.name == Roles.ADMIN
    );

    if (!account) {
      throw HttpError.badRequest("No account found");
    }
    return account.id;
  }

  async getStatuses(statusNames: string[]) {
    try {
      const statuses = await prisma.caseStatus.findMany({
        where: { name: { in: statusNames } },
      });

      if (statuses.length === 0) {
        throw HttpError.notFound("Status not found");
      }

      return statuses;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get statuses");
    }
  }

  async getAllStatuses() {
    try {
      const statuses = await prisma.caseStatus.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      });
      return statuses;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get all statuses");
    }
  }

  async convertFilterToWhere(filter?: ListCasesFilter) {
    const where: Prisma.ExaminationWhereInput = {};

    if (filter?.assignToUserId) {
      const assignToId = await this.getAssignTo(filter.assignToUserId);
      where.assignToId = assignToId;
    }

    if (filter?.caseTypes) {
      const types = await this.getCaseTypes(filter.caseTypes);
      where.examinationTypeId = {
        in: types.map((t) => t.id),
      };
    }

    if (filter?.statuses) {
      const statuses = await this.getStatuses(filter.statuses);
      where.statusId = {
        in: statuses.map((status) => status.id),
      };
    }

    return where;
  }

  async getCaseById(id: string) {
    try {
      const exam = await prisma.examination.findUnique({
        where: { id },
        include: {
          status: true,
          examinationType: true,
          assignTo: {
            include: {
              user: { include: { profilePhoto: true } },
            },
          }, referral: {
            include: {
              organization: true,
              claimant: { include: { address: true } },
              insurance: true,
              legalRepresentative: true,
              examType: true,
              documents: {
                include: {
                  document: true, // this gives you access to full document info
                },
              },
            },
          },
        },

      });

      if (!exam) {
        throw HttpError.notFound("Case not found");
      }

      return exam;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get case");
    }
  }

  async listCases(where?: Prisma.ExaminationWhereInput) {
    try {
      const exams = await prisma.examination.findMany({
        where: {
          ...where,
          deletedAt: null,
          referral: { isDraft: false },
        },
        include: {
          status: true,
          examinationType: true,
          assignTo: { include: { user: true } },
          referral: {
            include: {
              organization: true,
              claimant: true,
              insurance: true,
              legalRepresentative: true,
              examType: true,
              documents: {
                include: {
                  document: true, // this gives you access to full document info
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return exams;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to list cases");
    }
  }

  async updateStatus(caseId: string, status: string) {
    try {
      const statusItem = await prisma.caseStatus.findFirst({
        where: { name: status },
      });
      if (!statusItem) {
        throw HttpError.notFound("Status not found");
      }

      const exam = await prisma.examination.update({
        where: { id: caseId },
        data: { statusId: statusItem.id },
      });

      return exam;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to update status");
    }
  }

  async generateSecureLink(caseId: string) {
    try {
      const exam = await prisma.examination.findUnique({
        where: { id: caseId },
      });

      if (!exam) {
        throw HttpError.notFound("Case not found");
      }

      const token = v4();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      await prisma.examinationSecureLink.create({
        data: {
          examinationId: caseId,
          token,
          expiresAt,
          status: ExaminationSecureLinkStatus.PENDING,
          lastOpenedAt: null,
          submittedAt: null,
        },
      });

      return `${process.env.NEXT_PUBLIC_APP_URL}/claimant/availability/${token}`;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to generate secure link");
    }
  }
}

export default new CaseService();
