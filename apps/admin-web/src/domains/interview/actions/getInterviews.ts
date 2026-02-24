'use server';
import { getCurrentUser } from '@/domains/auth/server/session';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { InterviewData } from '../types/InterviewData';
import logger from '@/utils/logger';

const getInterviews = async (): Promise<InterviewData[]> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  try {
    const interviewSlots = await prisma.interviewSlot.findMany({
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

    logger.log('interviews fetched', interviews.length);
    return interviews;
  } catch (error) {
    logger.error('Error fetching interviews:', error);
    throw new Error('Failed to fetch interviews');
  }
};

export default getInterviews;
