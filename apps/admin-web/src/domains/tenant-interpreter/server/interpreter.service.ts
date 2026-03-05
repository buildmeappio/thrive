import 'server-only';
import { PrismaClient } from '@thrive/database';
import { InterpreterData, InterpreterFilters } from '../types/InterpreterData';

/**
 * Tenant-aware interpreter service
 */
class TenantInterpreterService {
  constructor(private prisma: PrismaClient) {}

  async getInterpreters(filters: InterpreterFilters = {}) {
    const { query, languageId, page = 1, pageSize = 10 } = filters;
    const skip = (page - 1) * pageSize;

    const where: any = {
      deletedAt: null,
    };

    if (query) {
      where.OR = [
        { companyName: { contains: query, mode: 'insensitive' } },
        { contactPerson: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (languageId) {
      where.languages = {
        some: {
          languageId,
          language: {
            deletedAt: null,
          },
        },
      };
    }

    const [interpreters, total] = await Promise.all([
      this.prisma.interpreter.findMany({
        where,
        include: {
          languages: {
            include: {
              language: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.interpreter.count({ where }),
    ]);

    const data: InterpreterData[] = interpreters.map(interpreter => ({
      id: interpreter.id,
      companyName: interpreter.companyName,
      contactPerson: interpreter.contactPerson,
      email: interpreter.email,
      phone: interpreter.phone || undefined,
      languages: interpreter.languages
        .filter(l => l.language.deletedAt === null)
        .map(l => ({
          id: l.language.id,
          name: l.language.name,
        })),
      createdAt: interpreter.createdAt,
      updatedAt: interpreter.updatedAt,
      deletedAt: interpreter.deletedAt || undefined,
    }));

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getLanguages() {
    return await this.prisma.language.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
}

export function createTenantInterpreterService(prisma: PrismaClient) {
  return new TenantInterpreterService(prisma);
}
