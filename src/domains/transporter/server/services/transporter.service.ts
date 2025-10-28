import prisma from "@/lib/db";
import {
  CreateTransporterData,
  UpdateTransporterData,
} from "../../types/TransporterData";

export class TransporterService {
  static async create(data: CreateTransporterData) {
    try {
      const transporter = await prisma.transporter.create({
        data: {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          phone: data.phone,
          email: data.email,
          serviceAreas: JSON.parse(JSON.stringify(data.serviceAreas)),
          vehicleTypes: data.vehicleTypes,
          fleetInfo: data.fleetInfo,
          baseAddress: data.baseAddress,
        },
      });

      return { success: true, data: transporter };
    } catch (error) {
      console.error("Error creating transporter:", error);
      return { success: false, error: "Failed to create transporter" };
    }
  }

  static async getMany(page = 1, limit = 10, search = "") {
    try {
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              {
                companyName: { contains: search, mode: "insensitive" as const },
              },
              {
                contactPerson: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
            deletedAt: null,
          }
        : { deletedAt: null };

      const [transporters, total] = await Promise.all([
        prisma.transporter.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.transporter.count({ where }),
      ]);

      return {
        success: true,
        data: transporters,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching transporters:", error);
      return { success: false, error: "Failed to fetch transporters" };
    }
  }

  static async getById(id: string) {
    try {
      const transporter = await prisma.transporter.findUnique({
        where: { id, deletedAt: null },
      });

      if (!transporter) {
        return { success: false, error: "Transporter not found" };
      }

      return { success: true, data: transporter };
    } catch (error) {
      console.error("Error fetching transporter:", error);
      return { success: false, error: "Failed to fetch transporter" };
    }
  }

  static async update(id: string, data: UpdateTransporterData) {
    try {
      const transporter = await prisma.transporter.update({
        where: { id },
        data: {
          ...data,
          serviceAreas: data.serviceAreas
            ? JSON.parse(JSON.stringify(data.serviceAreas))
            : undefined,
          updatedAt: new Date(),
        },
      });

      return { success: true, data: transporter };
    } catch (error) {
      console.error("Error updating transporter:", error);
      return { success: false, error: "Failed to update transporter" };
    }
  }

  static async delete(id: string) {
    try {
      await prisma.transporter.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting transporter:", error);
      return { success: false, error: "Failed to delete transporter" };
    }
  }
}
