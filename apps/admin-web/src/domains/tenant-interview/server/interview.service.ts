import 'server-only';
import { PrismaClient } from '@thrive/database';
import { InterviewData } from '../types/InterviewData';

/**
 * Tenant-aware interview service
 */
class TenantInterviewService {
  constructor(private prisma: PrismaClient) {}

  async getInterviews(): Promise<InterviewData[]> {
    const interviewSlots = await this.prisma.interviewSlot.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        application: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    const interviews: InterviewData[] = interviewSlots.map(slot => ({
      id: slot.id,
      examinerName: slot.application
        ? `${slot.application.firstName || ''} ${slot.application.lastName || ''}`.trim() ||
          slot.application.email
        : 'N/A',
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      duration: slot.duration,
      status: slot.status,
      applicationId: slot.applicationId || undefined,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString(),
    }));

    return interviews;
  }
}

export function createTenantInterviewService(prisma: PrismaClient) {
  return new TenantInterviewService(prisma);
}
