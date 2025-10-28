import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import { AvailabilityBlock } from "@prisma/client";

type CreateInterpreterInput = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  languageIds: string[];
  availability: Array<{ weekday: number; block: AvailabilityBlock }>;
};

type UpdateInterpreterInput = {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  languageIds?: string[];
  availability?: Array<{ weekday: number; block: AvailabilityBlock }>;
};

class InterpreterService {
  // Get all interpreters with pagination and filters
  async getInterpreters(filters: {
    query?: string;
    languageId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { query, languageId, page = 1, pageSize = 20 } = filters;
    const skip = (page - 1) * pageSize;

    try {
      const where: any = {
        deletedAt: null,
      };

      // Search filter
      if (query) {
        where.OR = [
          { companyName: { contains: query, mode: "insensitive" } },
          { contactPerson: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ];
      }

      // Language filter
      if (languageId) {
        where.languages = {
          some: {
            languageId: languageId,
          },
        };
      }

      const [interpreters, total] = await Promise.all([
        prisma.interpreter.findMany({
          where,
          include: {
            languages: {
              include: {
                language: true,
              },
            },
            availability: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.interpreter.count({ where }),
      ]);

      return {
        data: interpreters,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get interpreters");
    }
  }

  // Get interpreter by ID
  async getInterpreterById(id: string) {
    try {
      const interpreter = await prisma.interpreter.findUnique({
        where: { id, deletedAt: null },
        include: {
          languages: {
            include: {
              language: true,
            },
          },
          availability: {
            orderBy: [
              { weekday: 'asc' },
              { block: 'asc' }
            ]
          },
        },
      });

      if (!interpreter) {
        throw HttpError.notFound("Interpreter not found");
      }

      return interpreter;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get interpreter");
    }
  }

  // Create interpreter
  async createInterpreter(data: CreateInterpreterInput) {
    try {
      // Check if email already exists
      const existing = await prisma.interpreter.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
        },
      });

      if (existing) {
        throw HttpError.conflict("An interpreter with this email already exists");
      }

      const interpreter = await prisma.interpreter.create({
        data: {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          languages: {
            create: data.languageIds.map(languageId => ({
              languageId,
            })),
          },
          availability: {
            create: data.availability,
          },
        },
        include: {
          languages: {
            include: {
              language: true,
            },
          },
          availability: true,
        },
      });

      return interpreter;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to create interpreter");
    }
  }

  // Update interpreter
  async updateInterpreter(id: string, data: UpdateInterpreterInput) {
    try {
      // Check if interpreter exists
      const existing = await prisma.interpreter.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        throw HttpError.notFound("Interpreter not found");
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existing.email) {
        const emailExists = await prisma.interpreter.findFirst({
          where: {
            email: data.email,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (emailExists) {
          throw HttpError.conflict("An interpreter with this email already exists");
        }
      }

      // Prepare update data
      const updateData: any = {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
      };

      // Handle languages update
      if (data.languageIds) {
        // Delete existing languages and create new ones
        await prisma.interpreterLanguage.deleteMany({
          where: { interpreterId: id },
        });

        updateData.languages = {
          create: data.languageIds.map(languageId => ({
            languageId,
          })),
        };
      }

      // Handle availability update
      if (data.availability) {
        // Delete existing availability and create new ones
        await prisma.interpreterAvailability.deleteMany({
          where: { interpreterId: id },
        });

        updateData.availability = {
          create: data.availability,
        };
      }

      const interpreter = await prisma.interpreter.update({
        where: { id },
        data: updateData,
        include: {
          languages: {
            include: {
              language: true,
            },
          },
          availability: true,
        },
      });

      return interpreter;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to update interpreter");
    }
  }

  // Soft delete interpreter
  async deleteInterpreter(id: string) {
    try {
      const interpreter = await prisma.interpreter.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return interpreter;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to delete interpreter");
    }
  }

  // Get all languages (for filters and forms)
  async getLanguages() {
    try {
      const languages = await prisma.language.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      });

      return languages;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get languages");
    }
  }
}

const interpreterService = new InterpreterService();
export default interpreterService;

