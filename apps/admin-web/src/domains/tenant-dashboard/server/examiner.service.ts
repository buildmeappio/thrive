import 'server-only';
import { PrismaClient } from '@thrive/database';

/**
 * Tenant-aware examiner service
 */
class TenantExaminerService {
  constructor(private prisma: PrismaClient) {}

  async getExaminers() {
    // Get all active examiner profiles
    return await this.prisma.examinerProfile.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        account: {
          include: {
            user: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getExaminerSpecialties() {
    // Get unique specialties from examiner profiles
    const examiners = await this.prisma.examinerProfile.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        specialties: true,
      },
    });

    const allSpecialties = new Set<string>();
    examiners.forEach(examiner => {
      if (examiner.specialties && Array.isArray(examiner.specialties)) {
        examiner.specialties.forEach(specialty => {
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

export function createTenantExaminerService(prisma: PrismaClient) {
  return new TenantExaminerService(prisma);
}
