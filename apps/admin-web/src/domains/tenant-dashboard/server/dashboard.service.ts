import 'server-only';
import { PrismaClient, ExaminerStatus } from '@thrive/database';
import {
  endOfMonth,
  startOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { CaseDetailDtoType } from '@/domains/case/types/CaseDetailDtoType';
import { toCaseDto } from '@/domains/case/server/dto/case.dto';
import { ExaminerData } from '@/domains/examiner/types/ExaminerData';

/**
 * Tenant-aware dashboard service
 * Uses tenant-specific Prisma client instead of default prisma
 */
class TenantDashboardService {
  constructor(private prisma: PrismaClient) {}

  async getOrganizationCountThisMonth(): Promise<number> {
    const now = new Date();
    const [from, to] = [startOfMonth(now), endOfMonth(now)];
    return this.prisma.organization.count({
      where: {
        createdAt: { gte: from, lte: to },
        deletedAt: null,
      },
    });
  }

  async getActiveCaseCount(): Promise<number> {
    return await this.prisma.examination.count({
      where: {
        case: {
          deletedAt: null,
          isDraft: false,
        },
      },
    });
  }

  async getRecentCases(limit = 7): Promise<CaseDetailDtoType[]> {
    const pendingStatus = await this.prisma.caseStatus.findFirst({
      where: {
        name: 'Pending',
      },
    });

    if (!pendingStatus) {
      return [];
    }

    const rows = await this.prisma.examination.findMany({
      where: {
        statusId: pendingStatus.id,
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
                  },
                  take: 1,
                  include: {
                    account: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return await toCaseDto(rows);
  }

  async getWaitingCases(limit = 3): Promise<CaseDetailDtoType[]> {
    const waitingStatus = await this.prisma.caseStatus.findFirst({
      where: {
        name: 'Waiting to be Scheduled',
      },
    });

    if (!waitingStatus) {
      return [];
    }

    const rows = await this.prisma.examination.findMany({
      where: {
        statusId: waitingStatus.id,
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
                  },
                  take: 1,
                  include: {
                    account: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return await toCaseDto(rows);
  }

  async getWaitingToBeScheduledCount(): Promise<number> {
    const status = await this.prisma.caseStatus.findFirst({
      where: {
        name: 'Waiting to be Scheduled',
      },
    });

    if (!status) {
      return 0;
    }

    return await this.prisma.examination.count({
      where: {
        statusId: status.id,
        case: {
          deletedAt: null,
          isDraft: false,
        },
      },
    });
  }

  async getDueCasesCount(period: 'today' | 'tomorrow' | 'this-week'): Promise<number> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'tomorrow':
        const tomorrow = addDays(now, 1);
        startDate = startOfDay(tomorrow);
        endDate = endOfDay(tomorrow);
        break;
      case 'this-week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    return await this.prisma.examination.count({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
        case: {
          deletedAt: null,
          isDraft: false,
        },
      },
    });
  }

  async getExaminerCount(): Promise<number> {
    // Count examiner applications that are waiting to be reviewed
    // These are applications in review statuses (not yet approved/rejected/active)
    return await this.prisma.examinerApplication.count({
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
          ],
        },
      },
    });
  }

  async getExaminers(limit = 3): Promise<ExaminerData[]> {
    // TODO: Implement full ExaminerData fetching
    // For now, return empty array to avoid type errors
    // This requires fetching full examiner profile data with all required fields
    return [];
  }
}

export function createTenantDashboardService(prisma: PrismaClient) {
  return new TenantDashboardService(prisma);
}
