import 'server-only';
import { PrismaClient, ExaminerStatus } from '@thrive/database';

/**
 * Tenant-aware application service
 */
class TenantApplicationService {
  constructor(private prisma: PrismaClient) {}

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
    // Return all possible examiner statuses
    return [
      'DRAFT',
      'PENDING',
      'ACCEPTED',
      'REJECTED',
      'INFO_REQUESTED',
      'ACTIVE',
      'SUBMITTED',
      'IN_REVIEW',
      'MORE_INFO_REQUESTED',
      'INTERVIEW_REQUESTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'CONTRACT_SENT',
      'CONTRACT_SIGNED',
      'APPROVED',
      'WITHDRAWN',
      'SUSPENDED',
    ];
  }
}

export function createTenantApplicationService(prisma: PrismaClient) {
  return new TenantApplicationService(prisma);
}
