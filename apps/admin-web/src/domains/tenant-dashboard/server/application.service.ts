import 'server-only';
import { PrismaClient, ExaminerStatus, ContractStatus, Prisma } from '@thrive/database';

const includeRelations: Prisma.ExaminerApplicationInclude = {
  address: true,
  resumeDocument: true,
  ndaDocument: true,
  insuranceDocument: true,
  redactedIMEReportDocument: true,
  examinerProfile: {
    select: {
      id: true,
    },
  },
  interviewSlots: {
    where: {
      deletedAt: null,
    },
  },
  contracts: {
    where: {
      status: {
        in: [ContractStatus.DRAFT, ContractStatus.SENT, ContractStatus.SIGNED],
      },
    },
    select: {
      id: true,
      status: true,
      data: true,
      fieldValues: true,
      feeStructure: {
        include: {
          variables: {
            orderBy: [{ sortOrder: Prisma.SortOrder.asc }, { createdAt: Prisma.SortOrder.asc }],
          },
        },
      },
      createdAt: true,
      sentAt: true,
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
    take: 1,
  },
};

/**
 * Tenant-aware application service
 */
class TenantApplicationService {
  constructor(private prisma: PrismaClient) {}

  async getApplicationById(id: string) {
    const application = await this.prisma.examinerApplication.findUnique({
      where: { id, deletedAt: null },
      include: includeRelations,
    });

    if (
      application &&
      application.status === ExaminerStatus.INTERVIEW_REQUESTED &&
      application.interviewSlots?.some(slot => slot.status === 'BOOKED')
    ) {
      return this.prisma.examinerApplication.update({
        where: { id },
        data: { status: ExaminerStatus.INTERVIEW_SCHEDULED },
        include: includeRelations,
      });
    }

    return application;
  }

  async moveApplicationToReview(id: string) {
    return this.prisma.examinerApplication.update({
      where: { id, deletedAt: null },
      data: { status: ExaminerStatus.IN_REVIEW },
      include: includeRelations,
    });
  }

  async getApplications() {
    // Get all applications with status from SUBMITTED/PENDING till APPROVED
    return await this.prisma.examinerApplication.findMany({
      where: {
        deletedAt: null,
        status: {
          in: [
            ExaminerStatus.SUBMITTED,
            ExaminerStatus.PENDING,
            ExaminerStatus.IN_REVIEW,
            ExaminerStatus.MORE_INFO_REQUESTED,
            ExaminerStatus.INTERVIEW_REQUESTED,
            ExaminerStatus.INTERVIEW_SCHEDULED,
            ExaminerStatus.INTERVIEW_COMPLETED,
            ExaminerStatus.CONTRACT_SENT,
            ExaminerStatus.CONTRACT_SIGNED,
            ExaminerStatus.APPROVED,
          ],
        },
      },
      include: {
        address: true,
        resumeDocument: true,
        ndaDocument: true,
        insuranceDocument: true,
        redactedIMEReportDocument: true,
        interviewSlots: {
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getExaminerSpecialties() {
    // Get unique specialties from applications
    const applications = await this.prisma.examinerApplication.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        specialties: true,
      },
    });

    const allSpecialties = new Set<string>();
    applications.forEach(application => {
      if (application.specialties && Array.isArray(application.specialties)) {
        application.specialties.forEach(specialty => {
          if (specialty) allSpecialties.add(specialty);
        });
      }
    });

    return Array.from(allSpecialties).sort();
  }

  async getExaminerStatuses() {
    // Only statuses used in the current application flow (matches getApplications())
    return [
      'SUBMITTED',
      'PENDING',
      'IN_REVIEW',
      'MORE_INFO_REQUESTED',
      'INTERVIEW_REQUESTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'CONTRACT_SENT',
      'CONTRACT_SIGNED',
      'APPROVED',
    ];
  }
}

export function createTenantApplicationService(prisma: PrismaClient) {
  return new TenantApplicationService(prisma);
}
