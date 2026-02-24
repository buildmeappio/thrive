'use server';
import prisma from '@/lib/db';
import { DashboardMessage, MessagesFilters, MessagesResponse } from '../types/messages.types';
import { addDays } from 'date-fns';
import { formatFullName } from '@/utils/text';
import { getCurrentUser } from '@/domains/auth/server/session';
import logger from '@/utils/logger';

class MessagesService {
  // Get read status for messages for current user
  private async getReadStatuses(messageIds: string[], userId: string): Promise<Set<string>> {
    if (messageIds.length === 0) return new Set();

    const readStatuses = await prisma.messageReadStatus.findMany({
      where: {
        userId,
        messageId: { in: messageIds },
      },
      select: { messageId: true },
    });

    return new Set(readStatuses.map(r => r.messageId));
  }

  // Get recent messages for dashboard panel (limited to 5)
  async getRecentMessages(limit = 5, userId?: string): Promise<DashboardMessage[]> {
    const messages: DashboardMessage[] = [];

    try {
      // 1. Cases pending review
      const pendingStatus = await prisma.caseStatus.findFirst({
        where: { name: 'Pending' },
      });

      if (pendingStatus) {
        const pendingCases = await prisma.examination.findMany({
          where: {
            statusId: pendingStatus.id,
            case: { deletedAt: null, isDraft: false },
          },
          include: {
            case: {
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                caseType: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 2, // Limit per type to avoid overflow
        });

        for (const exam of pendingCases) {
          const caseNumber = exam.caseNumber || exam.id.slice(0, 8);
          messages.push({
            id: `case-pending-${caseNumber}`,
            type: 'case',
            title: `Case ${caseNumber} requires your review`,
            description: exam.case?.organization?.name
              ? `From ${exam.case.organization.name}`
              : undefined,
            entityId: exam.id,
            entityType: 'examination',
            priority: 'normal',
            isRead: false,
            createdAt: exam.createdAt,
            actionUrl: `/cases/${exam.id}`,
            actionLabel: 'Review',
          });
        }
      }

      // 2. Cases needing more information
      const infoNeededStatus = await prisma.caseStatus.findFirst({
        where: { name: { contains: 'Information', mode: 'insensitive' } },
      });

      if (infoNeededStatus) {
        const infoCases = await prisma.examination.findMany({
          where: {
            statusId: infoNeededStatus.id,
            case: { deletedAt: null, isDraft: false },
          },
          include: {
            case: {
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });

        for (const exam of infoCases) {
          const caseNumber = exam.caseNumber || exam.id.slice(0, 8);
          messages.push({
            id: `case-info-${caseNumber}`,
            type: 'case',
            title: `Case ${caseNumber} needs more information`,
            description: exam.case?.organization?.name
              ? `From ${exam.case.organization.name}`
              : undefined,
            entityId: exam.id,
            entityType: 'examination',
            priority: 'normal',
            isRead: false,
            createdAt: exam.createdAt,
            actionUrl: `/cases/${exam.id}`,
            actionLabel: 'View',
          });
        }
      }

      // 3. Cases due soon (within 48 hours)
      const twoDaysFromNow = addDays(new Date(), 2);
      const dueCases = await prisma.examination.findMany({
        where: {
          dueDate: {
            lte: twoDaysFromNow,
            gte: new Date(),
          },
          case: { deletedAt: null, isDraft: false },
        },
        include: {
          case: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 1,
      });

      for (const exam of dueCases) {
        const caseNumber = exam.caseNumber || exam.id.slice(0, 8);
        const hoursUntilDue = Math.round(
          (exam.dueDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        );
        messages.push({
          id: `case-due-${caseNumber}`,
          type: 'case',
          title: `Case ${caseNumber} is due ${hoursUntilDue <= 24 ? 'today' : 'soon'}`,
          description: exam.dueDate ? `Due: ${exam.dueDate.toLocaleDateString()}` : undefined,
          entityId: exam.id,
          entityType: 'examination',
          priority: hoursUntilDue <= 24 ? 'urgent' : 'normal',
          isRead: false,
          createdAt: exam.createdAt,
          actionUrl: `/cases/${exam.id}`,
          actionLabel: 'View',
        });
      }

      // 4. Organizations without superadmin (need invitation)
      const pendingOrgs = await prisma.organization.findMany({
        where: {
          isAuthorized: false,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      for (const org of pendingOrgs) {
        messages.push({
          id: `org-pending-${org.id}`,
          type: 'organization',
          title: `New organization registered: ${org.name}`,
          description: 'Superadmin invitation needed',
          entityId: org.id,
          entityType: 'organization',
          priority: 'normal',
          isRead: false,
          createdAt: org.createdAt,
          actionUrl: `/organization/${org.id}`,
          actionLabel: 'Review',
        });
      }

      // 5. Examiner applications pending interview
      const interviewRequestedStatus = await prisma.examinerApplication.findMany({
        where: {
          status: 'INTERVIEW_REQUESTED',
          deletedAt: null,
        },
        include: {
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      for (const app of interviewRequestedStatus) {
        const name =
          app.firstName && app.lastName
            ? formatFullName(app.firstName, app.lastName)
            : app.email || 'Examiner';
        messages.push({
          id: `examiner-interview-${app.id}`,
          type: 'examiner',
          title: `Interview request sent to: ${name}`,
          description: 'Waiting for scheduling',
          entityId: app.id,
          entityType: 'examinerApplication',
          priority: 'normal',
          isRead: false,
          createdAt: app.createdAt,
          actionUrl: `/application/${app.id}`,
          actionLabel: 'View',
        });
      }

      // Sort by priority and date
      const sorted = messages.sort((a, b) => {
        const priorityOrder = { urgent: 0, normal: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      // Update isRead status based on database if userId is provided
      if (userId && sorted.length > 0) {
        const messageIds = sorted.map(m => m.id);
        const readStatuses = await this.getReadStatuses(messageIds, userId);

        // Update isRead for each message
        for (const message of sorted) {
          message.isRead = readStatuses.has(message.id);
        }
      }

      // Filter out read messages for dashboard panel
      const unreadMessages = sorted.filter(m => !m.isRead);

      // Limit to requested number (only unread messages)
      return unreadMessages.slice(0, limit);
    } catch (error) {
      logger.error('Error fetching messages:', error);
      // Return empty array to prevent dashboard crash
      return [];
    }
  }

  // Get messages with pagination and filters
  async getMessages(filters: MessagesFilters = {}, userId?: string): Promise<MessagesResponse> {
    const { type, isRead, page = 1, pageSize = 20 } = filters;

    const skip = (page - 1) * pageSize;

    try {
      // Get all messages (same logic as getRecentMessages but without limit)
      const allMessages = await this.getRecentMessages(1000, userId); // Get more for filtering

      // Apply filters
      let filtered = allMessages;
      if (type && type !== 'all') {
        filtered = filtered.filter(m => m.type === type);
      }
      if (isRead !== undefined && typeof isRead === 'boolean') {
        filtered = filtered.filter(m => m.isRead === isRead);
      }

      // Sort by priority and date
      filtered.sort((a, b) => {
        const priorityOrder = { urgent: 0, normal: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + pageSize);
      const unreadCount = allMessages.filter(m => !m.isRead).length;

      return {
        messages: paginated,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        unreadCount,
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        messages: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
        unreadCount: 0,
      };
    }
  }

  // Get unread count
  async getUnreadCount(userId?: string): Promise<number> {
    try {
      const messages = await this.getRecentMessages(100, userId);
      return messages.filter(m => !m.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark message as read for current user
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      await prisma.messageReadStatus.upsert({
        where: {
          userId_messageId: {
            userId,
            messageId,
          },
        },
        create: {
          userId,
          messageId,
        },
        update: {
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Mark message as unread for current user (remove read status)
  async markMessageAsUnread(messageId: string, userId: string): Promise<void> {
    try {
      await prisma.messageReadStatus.deleteMany({
        where: {
          userId,
          messageId,
        },
      });
    } catch (error) {
      console.error('Error marking message as unread:', error);
      throw error;
    }
  }
}

const messagesService = new MessagesService();

export async function getRecentMessages(limit = 5): Promise<DashboardMessage[]> {
  const user = await getCurrentUser();
  return await messagesService.getRecentMessages(limit, user?.id);
}

export async function getMessages(filters?: MessagesFilters): Promise<MessagesResponse> {
  const user = await getCurrentUser();
  return await messagesService.getMessages(filters, user?.id);
}

export async function getUnreadMessagesCount(): Promise<number> {
  const user = await getCurrentUser();
  return await messagesService.getUnreadCount(user?.id);
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await messagesService.markMessageAsRead(messageId, user.id);
}

export async function markMessageAsUnread(messageId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await messagesService.markMessageAsUnread(messageId, user.id);
}
