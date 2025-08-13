import { type Notification, type NotificationType, Role } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  approvalRequestId?: string;
  expiresAt?: Date;
}

interface CreateAdminNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  approvalRequestId?: string;
  expiresAt?: Date;
}

export class NotificationService {
  async create(data: CreateNotificationData): Promise<Notification> {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          approvalRequestId: data.approvalRequestId,
          expiresAt: data.expiresAt,
        },
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async createForAdmins(data: CreateAdminNotificationData): Promise<Notification[]> {
    try {
      // Get all admin users
      const adminUsers = await prisma.user.findMany({
        where: {
          role: {
            in: [Role.SUPER_ADMIN],
          },
          isActive: true,
        },
      });

      const notifications = await Promise.all(
        adminUsers.map(admin =>
          this.create({
            userId: admin.id,
            type: data.type,
            title: data.title,
            message: data.message,
            approvalRequestId: data.approvalRequestId,
            expiresAt: data.expiresAt,
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error creating admin notifications:', error);
      throw new Error('Failed to create admin notifications');
    }
  }

  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const { limit = 50, offset = 0, unreadOnly = false } = options;

      const where: any = {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      };

      if (unreadOnly) {
        where.isRead = false;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            approvalRequest: true,
          },
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: {
            userId,
            isRead: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        }),
      ]);

      return {
        notifications,
        total,
        unreadCount,
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      return await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user can only mark their own notifications
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId, // Ensure user can only delete their own notifications
        },
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`Cleaned up ${result.count} expired notifications`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw new Error('Failed to cleanup expired notifications');
    }
  }

  // Send notification for approval workflow events
  async sendApprovalNotification(
    approvalRequestId: string,
    type: 'REQUEST_CREATED' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'ADDITIONAL_INFO_REQUIRED',
    recipientUserId: string,
    _additionalData?: any
  ): Promise<Notification> {
    const titles = {
      REQUEST_CREATED: 'New Approval Request',
      REQUEST_APPROVED: 'Application Approved',
      REQUEST_REJECTED: 'Application Rejected',
      ADDITIONAL_INFO_REQUIRED: 'Additional Information Required',
    };

    const messages = {
      REQUEST_CREATED: 'A new approval request has been submitted and requires your review.',
      REQUEST_APPROVED: 'Your application has been approved! You can now access the system.',
      REQUEST_REJECTED:
        'Your application has been rejected. Please review the feedback and resubmit if possible.',
      ADDITIONAL_INFO_REQUIRED:
        'Additional information is required for your application. Please review and provide the requested details.',
    };

    return await this.create({
      userId: recipientUserId,
      type: 'APPROVAL_REQUEST',
      title: titles[type],
      message: messages[type],
      approvalRequestId,
    });
  }

  // Send compliance reminders
  async sendComplianceReminder(
    userId: string,
    reminderType: 'CONSENT_EXPIRY' | 'DATA_RETENTION' | 'LICENSE_EXPIRY' | 'INSURANCE_EXPIRY',
    expiryDate: Date
  ): Promise<Notification> {
    const titles = {
      CONSENT_EXPIRY: 'Consent Renewal Required',
      DATA_RETENTION: 'Data Retention Notice',
      LICENSE_EXPIRY: 'License Renewal Required',
      INSURANCE_EXPIRY: 'Insurance Renewal Required',
    };

    const messages = {
      CONSENT_EXPIRY: `Your consent will expire on ${expiryDate.toLocaleDateString()}. Please renew to continue using the service.`,
      DATA_RETENTION: `Your data retention period will expire on ${expiryDate.toLocaleDateString()}. Please review your data retention preferences.`,
      LICENSE_EXPIRY: `Your professional license will expire on ${expiryDate.toLocaleDateString()}. Please update your license information.`,
      INSURANCE_EXPIRY: `Your malpractice insurance will expire on ${expiryDate.toLocaleDateString()}. Please update your insurance information.`,
    };

    return await this.create({
      userId,
      type: 'COMPLIANCE_REMINDER',
      title: titles[reminderType],
      message: messages[reminderType],
      expiresAt: expiryDate,
    });
  }
}
