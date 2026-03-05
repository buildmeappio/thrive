import 'server-only';
import { PrismaClient } from '@thrive/database';
import { TransporterData } from '../types/TransporterData';

/**
 * Tenant-aware transporter service
 */
class TenantTransporterService {
  constructor(private prisma: PrismaClient) {}

  async getTransporters(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transporters, total] = await Promise.all([
      this.prisma.transporter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transporter.count({ where }),
    ]);

    const data: TransporterData[] = transporters.map(transporter => {
      // serviceAreas is a JSON field, parse it
      const serviceAreas = Array.isArray(transporter.serviceAreas)
        ? transporter.serviceAreas
        : typeof transporter.serviceAreas === 'object' && transporter.serviceAreas !== null
          ? [transporter.serviceAreas]
          : [];

      return {
        id: transporter.id,
        companyName: transporter.companyName,
        contactPerson: transporter.contactPerson,
        phone: transporter.phone,
        email: transporter.email,
        serviceAreas: serviceAreas.map((sa: any) => ({
          province: sa?.province || '',
          address: sa?.address || '',
        })),
        status: transporter.status as 'ACTIVE' | 'SUSPENDED',
        createdAt: transporter.createdAt,
        updatedAt: transporter.updatedAt,
        deletedAt: transporter.deletedAt || undefined,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export function createTenantTransporterService(prisma: PrismaClient) {
  return new TenantTransporterService(prisma);
}
