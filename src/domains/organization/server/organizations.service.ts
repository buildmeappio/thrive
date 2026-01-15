"use server";
import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";

export async function listOrganizations() {
  try {
    return await prisma.organization.findMany({
      include: {
        type: true,
        address: true,
        manager: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Sort by creation time, newest first
      },
    });
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, "Failed to list organizations", {
      details: error,
    });
  }
}

export async function getOrganizationById(id: string) {
  try {
    return await prisma.organization.findUnique({
      where: { id },
      include: {
        type: true,
        address: true,
        manager: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
            department: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, "Failed to get organization", { details: error });
  }
}

export async function approveOrganization(
  id: string,
  approverAccountId: string,
) {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Check if organization exists and is not already approved
      const current = await tx.organization.findUnique({
        where: { id },
        select: { id: true, approvedBy: true },
      });

      if (!current) {
        throw new HttpError(404, "Organization not found");
      }

      if (current.approvedBy) {
        throw new HttpError(409, "Organization is already approved", {
          details: { organizationId: id },
        });
      }

      // Approve organization
      const res = await tx.organization.update({
        where: { id },
        data: {
          approvedBy: approverAccountId,
          approvedAt: new Date(),
          rejectedBy: null,
          rejectedAt: null,
          rejectedReason: null,
          isAuthorized: true,
        },
        include: {
          type: true,
          address: true,
          manager: {
            include: {
              account: { include: { user: true } },
              department: true,
            },
          },
        },
      });

      return res;
    });
    return updated;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, "Failed to approve organization", {
      details: error,
    });
  }
}

export async function rejectOrganization(
  id: string,
  rejectorAccountId: string,
  reason: string,
) {
  if (!reason?.trim()) throw new HttpError(400, "Rejection reason is required");
  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Check if organization exists
      const current = await tx.organization.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!current) {
        throw new HttpError(404, "Organization not found");
      }

      // Reject organization
      const res = await tx.organization.update({
        where: { id },
        data: {
          rejectedBy: rejectorAccountId,
          rejectedAt: new Date(),
          rejectedReason: reason.trim(),
          // keep approved fields cleared and authorization off
          approvedBy: null,
          approvedAt: null,
          isAuthorized: false,
        },
        include: {
          type: true,
          address: true,
          manager: {
            include: {
              account: { include: { user: true } },
              department: true,
            },
          },
        },
      });

      return res;
    });
    return updated;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, "Failed to reject organization", {
      details: error,
    });
  }
}

export async function requestMoreInfoOrganization(id: string) {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Check if organization exists
      const current = await tx.organization.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!current) {
        throw new HttpError(404, "Organization not found");
      }

      // Request more info (no status change needed, just mark that info was requested)
      return tx.organization.findUnique({
        where: { id },
        include: {
          type: true,
          address: true,
          manager: {
            include: {
              account: { include: { user: true } },
              department: true,
            },
          },
        },
      });
    });
    if (!updated) throw new HttpError(404, "Organization not found");
    return updated;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, "Failed to request more info from organization", {
      details: error,
    });
  }
}

export async function listOrganizationTypes() {
  try {
    return await prisma.organizationType.findMany();
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, "Failed to list organization types", {
      details: error,
    });
  }
}

export async function checkOrganizationNameExists(
  name: string,
): Promise<boolean> {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return false;
    }

    // Find all organizations with similar names (case-insensitive)
    const organizations = await prisma.organization.findMany({
      where: {
        name: {
          contains: trimmedName,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Check for exact match (case-insensitive)
    const exactMatch = organizations.some(
      (org) => org.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    return exactMatch;
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, "Failed to check organization name", {
      details: error,
    });
  }
}

export async function createOrganization(data: {
  organizationTypeName: string;
  organizationName: string;
  addressLookup: string;
  streetAddress: string;
  aptUnitSuite?: string;
  city: string;
  postalCode: string;
  province: string;
  organizationWebsite?: string;
}) {
  try {
    // Find organization type by name
    const organizationType = await prisma.organizationType.findFirst({
      where: {
        name: {
          equals: data.organizationTypeName,
          mode: "insensitive",
        },
      },
    });

    if (!organizationType) {
      throw new HttpError(404, "Organization type not found", {
        details: { typeName: data.organizationTypeName },
      });
    }

    // Create organization with address in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create address first
      const address = await tx.address.create({
        data: {
          address: data.addressLookup,
          street: data.streetAddress,
          suite: data.aptUnitSuite || null,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
        },
      });

      // Create organization with ACCEPTED status (auto-approved)
      const organization = await tx.organization.create({
        data: {
          typeId: organizationType.id,
          addressId: address.id,
          name: data.organizationName.trim(),
          website: data.organizationWebsite?.trim() || null,
          isAuthorized: true,
        },
        include: {
          type: true,
          address: true,
        },
      });

      return organization;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, "Failed to create organization", {
      details: error,
    });
  }
}
