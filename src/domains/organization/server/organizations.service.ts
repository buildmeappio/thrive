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
      // enforce PENDING -> ACCEPTED
      const res = await tx.organization.updateMany({
        where: { id, status: "PENDING" },
        data: {
          status: "ACCEPTED",
          approvedBy: approverAccountId,
          approvedAt: new Date(),
          rejectedBy: null,
          rejectedAt: null,
          rejectedReason: null,
          isAuthorized: true,
        },
      });
      if (res.count === 0) {
        const current = await tx.organization.findUnique({
          where: { id },
          select: { status: true },
        });
        throw new HttpError(409, "Invalid status transition", {
          details: {
            expected: "PENDING",
            actual: current?.status ?? "NOT_FOUND",
          },
        });
      }
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
      // enforce PENDING -> REJECTED
      const res = await tx.organization.updateMany({
        where: { id, status: "PENDING" },
        data: {
          status: "REJECTED",
          rejectedBy: rejectorAccountId,
          rejectedAt: new Date(),
          rejectedReason: reason.trim(),
          // keep approved fields cleared and authorization off
          approvedBy: null,
          approvedAt: null,
          isAuthorized: false,
        },
      });
      if (res.count === 0) {
        const current = await tx.organization.findUnique({
          where: { id },
          select: { status: true },
        });
        throw new HttpError(409, "Invalid status transition", {
          details: {
            expected: "PENDING",
            actual: current?.status ?? "NOT_FOUND",
          },
        });
      }
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
    throw new HttpError(500, "Failed to reject organization", {
      details: error,
    });
  }
}

export async function requestMoreInfoOrganization(id: string) {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Update status to INFO_REQUESTED
      const res = await tx.organization.updateMany({
        where: { id, status: "PENDING" },
        data: {
          status: "INFO_REQUESTED",
        },
      });
      if (res.count === 0) {
        const current = await tx.organization.findUnique({
          where: { id },
          select: { status: true },
        });
        throw new HttpError(409, "Invalid status transition", {
          details: {
            expected: "PENDING",
            actual: current?.status ?? "NOT_FOUND",
          },
        });
      }
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
    throw new HttpError(
      500,
      "Failed to update organization status to INFO_REQUESTED",
      { details: error },
    );
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
