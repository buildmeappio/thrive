import type { AuditLog, AuditAction, AuditSeverity } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';

interface LogData {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: AuditAction | string;
  resource: string;
  resourceId?: string;
  description: string;
  severity?: AuditSeverity;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  requestMethod?: string;
  requestUrl?: string;
  requestHeaders?: Record<string, any>;
  responseStatus?: number;
  responseTime?: number;
  dataCategory?: string;
  accessReason?: string;
  errorCode?: string;
  errorMessage?: string;
  stackTrace?: string;
  timezone?: string;
  location?: Record<string, any>;
}

export class AuditLogService {
  async log(data: LogData): Promise<AuditLog> {
    try {
      // Sanitize request headers (remove sensitive data)
      const sanitizedHeaders = data.requestHeaders
        ? this.sanitizeHeaders(data.requestHeaders)
        : null;

      return await prisma.auditLog.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress || 'unknown',
          userAgent: data.userAgent,
          action: data.action as AuditAction,
          resource: data.resource,
          resourceId: data.resourceId,
          description: data.description,
          severity: data.severity || 'MEDIUM',
          oldValues: data.oldValues ? this.sanitizeData(data.oldValues) : undefined,
          newValues: data.newValues ? this.sanitizeData(data.newValues) : undefined,
          requestMethod: data.requestMethod,
          requestUrl: data.requestUrl,
          requestHeaders: sanitizedHeaders || undefined,
          responseStatus: data.responseStatus,
          responseTime: data.responseTime,
          dataCategory: data.dataCategory,
          accessReason: data.accessReason,
          errorCode: data.errorCode,
          errorMessage: data.errorMessage,
          stackTrace: data.stackTrace,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: data.location,
          timestamp: new Date(),
          retentionDate: this.calculateRetentionDate(),
        },
      });
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw error to prevent breaking main functionality
      // In production, you might want to use a fallback logging mechanism
      throw error;
    }
  }

  async getUserAuditLogs(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      actions?: string[];
      resources?: string[];
      dateRange?: {
        from: Date;
        to: Date;
      };
      severity?: string[];
    } = {}
  ): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    const { limit = 50, offset = 0, actions, resources, dateRange, severity } = options;

    const where: any = { userId };

    if (actions && actions.length > 0) {
      where.action = { in: actions };
    }

    if (resources && resources.length > 0) {
      where.resource = { in: resources };
    }

    if (dateRange) {
      where.timestamp = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    if (severity && severity.length > 0) {
      where.severity = { in: severity };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getResourceAuditLogs(
    resource: string,
    resourceId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    const { limit = 50, offset = 0 } = options;

    const where = { resource, resourceId };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getSecurityEvents(
    options: {
      limit?: number;
      offset?: number;
      severity?: string[];
      dateRange?: {
        from: Date;
        to: Date;
      };
    } = {}
  ): Promise<AuditLog[]> {
    const { limit = 100, offset = 0, severity, dateRange } = options;

    const securityActions = [
      'LOGIN_FAILED',
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      'DATA_BREACH_DETECTED',
      'PERMISSION_CHANGE',
      'ROLE_CHANGE',
    ];

    const where: any = {
      action: { in: securityActions },
    };

    if (severity && severity.length > 0) {
      where.severity = { in: severity };
    }

    if (dateRange) {
      where.timestamp = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getComplianceReport(
    dateRange: { from: Date; to: Date },
    userId?: string
  ): Promise<{
    totalActivities: number;
    dataAccess: number;
    dataModification: number;
    dataExport: number;
    dataDeletion: number;
    consentChanges: number;
    securityEvents: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    const where: any = {
      timestamp: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    const [
      total,
      dataAccess,
      dataModification,
      dataExport,
      dataDeletion,
      consentChanges,
      securityEvents,
      categoryStats,
      severityStats,
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({
        where: {
          ...where,
          action: { in: ['READ', 'DOCUMENT_VIEW'] },
        },
      }),
      prisma.auditLog.count({
        where: {
          ...where,
          action: { in: ['UPDATE', 'CREATE'] },
        },
      }),
      prisma.auditLog.count({
        where: {
          ...where,
          action: { in: ['DATA_EXPORT', 'DATA_PRINT'] },
        },
      }),
      prisma.auditLog.count({
        where: {
          ...where,
          action: 'DELETE',
        },
      }),
      prisma.auditLog.count({
        where: {
          ...where,
          action: { in: ['CONSENT_GIVEN', 'CONSENT_WITHDRAWN'] },
        },
      }),
      prisma.auditLog.count({
        where: {
          ...where,
          action: {
            in: ['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS_ATTEMPT', 'DATA_BREACH_DETECTED'],
          },
        },
      }),
      // Get category breakdown
      prisma.auditLog.groupBy({
        by: ['dataCategory'],
        where,
        _count: true,
      }),
      // Get severity breakdown
      prisma.auditLog.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
    ]);

    const byCategory = categoryStats.reduce(
      (acc, stat) => {
        acc[stat.dataCategory || 'Unknown'] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const bySeverity = severityStats.reduce(
      (acc, stat) => {
        acc[stat.severity || 'MEDIUM'] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalActivities: total,
      dataAccess,
      dataModification,
      dataExport,
      dataDeletion,
      consentChanges,
      securityEvents,
      byCategory,
      bySeverity,
    };
  }

  async cleanupExpiredLogs(): Promise<number> {
    const result = await prisma.auditLog.deleteMany({
      where: {
        retentionDate: { lt: new Date() },
        isArchived: false,
      },
    });

    console.log(`Cleaned up ${result.count} expired audit logs`);
    return result.count;
  }

  async archiveOldLogs(archiveThresholdDays: number = 365): Promise<number> {
    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - archiveThresholdDays);

    const result = await prisma.auditLog.updateMany({
      where: {
        timestamp: { lt: archiveDate },
        isArchived: false,
      },
      data: {
        isArchived: true,
      },
    });

    console.log(`Archived ${result.count} old audit logs`);
    return result.count;
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    const sanitized = { ...headers };

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password',
      'passwordHash',
      'hashedPassword',
      'token',
      'accessToken',
      'refreshToken',
      'ssn',
      'sin', // Social Insurance Number (Canada)
      'creditCard',
      'bankAccount',
    ];

    const sanitized = { ...data };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const result = { ...obj };

      Object.keys(result).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof result[key] === 'object') {
          result[key] = sanitizeObject(result[key]);
        }
      });

      return result;
    };

    return sanitizeObject(sanitized);
  }

  private calculateRetentionDate(): Date {
    // Canadian compliance typically requires 7 years retention
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + 7);
    return retentionDate;
  }
}
