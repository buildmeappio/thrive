import 'server-only';
import { PrismaClient } from '@thrive/database';
import { CaseData } from '../types/CaseData';

/**
 * Tenant-aware case service
 */
class TenantCaseService {
  constructor(private prisma: PrismaClient) {}

  async getCases(): Promise<CaseData[]> {
    const examinations = await this.prisma.examination.findMany({
      where: {
        case: {
          deletedAt: null,
          isDraft: false,
        },
        deletedAt: null,
      },
      include: {
        examiner: { include: { user: true } },
        examinationType: true,
        status: true,
        claimant: { include: { address: true } },
        case: {
          include: {
            caseType: true,
            organization: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return examinations
      .filter(exam => {
        // Filter out examinations with deleted related entities
        if (exam.claimant.deletedAt !== null) return false;
        if (exam.examinationType.deletedAt !== null) return false;
        if (exam.status.deletedAt !== null) return false;
        if (exam.case.caseType?.deletedAt !== null) return false;
        if (exam.case.organization?.deletedAt !== null) return false;
        if (exam.examiner?.deletedAt !== null) return false;
        return true;
      })
      .map(exam => ({
        id: exam.id,
        number: exam.caseNumber,
        claimant: `${exam.claimant.firstName} ${exam.claimant.lastName}`,
        organization: exam.case.organization?.name || 'Unknown',
        caseType: exam.case.caseType?.name || 'Unknown',
        status: exam.status.name,
        urgencyLevel: exam.urgencyLevel || 'MEDIUM',
        reason: exam.notes || '',
        examinerId: exam.examiner?.user?.id || 'Unknown',
        submittedAt: exam.createdAt.toISOString(),
        assignedAt: exam.assignedAt ? exam.assignedAt.toISOString() : undefined,
        dueDate: exam.dueDate ? exam.dueDate.toISOString() : null,
      }));
  }

  async getCaseTypes(): Promise<string[]> {
    const rows = await this.prisma.caseType.findMany({
      where: {
        deletedAt: null,
      },
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => r.name);
  }

  async getCaseStatuses(): Promise<string[]> {
    const rows = await this.prisma.caseStatus.findMany({
      where: {
        deletedAt: null,
      },
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => r.name);
  }

  async getPriorityLevels(): Promise<string[]> {
    return ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  }
}

export function createTenantCaseService(prisma: PrismaClient) {
  return new TenantCaseService(prisma);
}
