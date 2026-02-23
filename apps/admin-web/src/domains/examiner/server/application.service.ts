import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import {
  ExaminerStatus,
  SecureLinkStatus,
  ContractStatus,
  Prisma,
} from "@prisma/client";

const includeRelations: Prisma.ExaminerApplicationInclude = {
  address: true,
  resumeDocument: true,
  ndaDocument: true,
  insuranceDocument: true,
  redactedIMEReportDocument: true,
  interviewSlots: {
    where: {
      deletedAt: null,
    },
  },
  contracts: {
    where: {
      status: {
        in: [ContractStatus.DRAFT, ContractStatus.SENT, ContractStatus.SIGNED],
      },
    },
    select: {
      id: true,
      status: true,
      data: true,
      fieldValues: true, // Include fieldValues to access fees_overrides
      feeStructure: {
        include: {
          variables: {
            orderBy: [
              { sortOrder: Prisma.SortOrder.asc },
              { createdAt: Prisma.SortOrder.asc },
            ],
          },
        },
      },
      createdAt: true,
      sentAt: true,
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
    take: 1, // Get the most recent contract
  },
};

export const getRecentApplications = async (
  limit?: number,
  status?: string | string[],
) => {
  return prisma.examinerApplication.findMany({
    where: {
      deletedAt: null,
      ...(status && {
        status: Array.isArray(status)
          ? { in: status as any[] }
          : (status as any),
      }),
    },
    include: includeRelations,
    orderBy: {
      createdAt: "desc",
    },
    take: limit || 10,
  });
};

export const getApplicationById = async (id: string) => {
  const application = await prisma.examinerApplication.findUnique({
    where: { id },
    include: includeRelations,
  });

  // If application has a booked interview slot but status is still INTERVIEW_REQUESTED,
  // automatically update status to INTERVIEW_SCHEDULED
  if (
    application &&
    application.status === ExaminerStatus.INTERVIEW_REQUESTED &&
    application.interviewSlots &&
    application.interviewSlots.some((slot) => slot.status === "BOOKED")
  ) {
    return prisma.examinerApplication.update({
      where: { id },
      data: {
        status: ExaminerStatus.INTERVIEW_SCHEDULED,
      },
      include: includeRelations,
    });
  }

  return application;
};

export const getApplicationCount = async (status?: string | string[]) => {
  return prisma.examinerApplication.count({
    where: {
      deletedAt: null,
      ...(status && {
        status: Array.isArray(status)
          ? { in: status as any[] }
          : (status as any),
      }),
    },
  });
};

export const approveApplication = async (id: string, accountId?: string) => {
  return prisma.examinerApplication.update({
    where: { id },
    data: {
      status: ExaminerStatus.APPROVED,
      approvedBy: accountId || null,
      approvedAt: new Date(),
    },
    include: includeRelations,
  });
};

export const rejectApplication = async (
  id: string,
  accountId?: string,
  rejectionReason?: string,
) => {
  return prisma.examinerApplication.update({
    where: { id },
    data: {
      status: ExaminerStatus.REJECTED,
      rejectedBy: accountId || null,
      rejectedAt: new Date(),
      rejectedReason: rejectionReason,
    },
    include: includeRelations,
  });
};

export const requestMoreInfoFromApplication = async (
  id: string,
  _message: string,
  _documentsRequired: boolean,
) => {
  return prisma.examinerApplication.update({
    where: { id },
    data: {
      status: ExaminerStatus.MORE_INFO_REQUESTED,
    },
    include: includeRelations,
  });
};

export const moveApplicationToReview = async (id: string) => {
  return prisma.examinerApplication.update({
    where: { id },
    data: {
      status: ExaminerStatus.IN_REVIEW,
    },
    include: includeRelations,
  });
};

export const requestApplicationInterview = async (id: string) => {
  return prisma.examinerApplication.update({
    where: { id },
    data: {
      status: ExaminerStatus.INTERVIEW_REQUESTED,
    },
    include: includeRelations,
  });
};

export const scheduleApplicationInterview = async (id: string) => {
  return prisma.examinerApplication.update({
    where: { id },
    data: {
      status: ExaminerStatus.INTERVIEW_SCHEDULED,
    },
    include: includeRelations,
  });
};

export const markApplicationInterviewCompleted = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    // First, get the application to check for interview slots
    const existingApplication = await tx.examinerApplication.findUnique({
      where: { id },
      include: { interviewSlots: true },
    });

    if (!existingApplication) {
      throw new Error("Application not found");
    }

    // Update all booked interview slots status to COMPLETED
    if (
      existingApplication.interviewSlots &&
      existingApplication.interviewSlots.length > 0
    ) {
      const bookedSlots = existingApplication.interviewSlots.filter(
        (slot) => slot.status === "BOOKED",
      );

      if (bookedSlots.length > 0) {
        await tx.interviewSlot.updateMany({
          where: {
            id: { in: bookedSlots.map((slot) => slot.id) },
            status: "BOOKED",
          },
          data: {
            status: "COMPLETED",
          },
        });
      }
    }

    // Update application status
    return tx.examinerApplication.update({
      where: { id },
      data: {
        status: ExaminerStatus.INTERVIEW_COMPLETED,
      },
      include: includeRelations,
    });
  });
};

type CreateInterviewSchedulingLinkParams = {
  applicationId: string;
  expiresInDays: number;
  token: string;
};

export const invalidateAllInterviewSchedulingLinks = async (
  applicationId: string,
) => {
  try {
    const secureLinks = await prisma.secureLink.updateMany({
      where: {
        applicationSecureLink: {
          some: {
            applicationId,
          },
        },
      },
      data: {
        status: SecureLinkStatus.INVALID,
      },
    });
    return secureLinks;
  } catch (error) {
    logger.error(
      `Failed to invalidate all interview scheduling links for application ${applicationId}: ${error}`,
    );
    throw HttpError.fromError(
      error,
      `Failed to invalidate all interview scheduling links for application ${applicationId}`,
    );
  }
};

export const createInterviewSchedulingLink = async (
  params: CreateInterviewSchedulingLinkParams,
) => {
  await invalidateAllInterviewSchedulingLinks(params.applicationId);

  // Calculate expiration date
  const expiresAt = new Date(
    Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000,
  );

  // Create SecureLink record
  const secureLink = await prisma.secureLink.create({
    data: {
      token: params.token,
      expiresAt,
      status: "PENDING",
    },
  });

  // Create ApplicationSecureLink to link application to SecureLink
  const applicationSecureLink = await prisma.applicationSecureLink.create({
    data: {
      applicationId: params.applicationId,
      secureLinkId: secureLink.id,
    },
  });

  return {
    secureLink,
    applicationSecureLink,
  };
};

export const getInterviewSchedulingLink = async (applicationId: string) => {
  // Find the most recent non-deleted ApplicationSecureLink for this application
  const applicationSecureLink = await prisma.applicationSecureLink.findFirst({
    where: {
      applicationId,
      deletedAt: null,
      secureLink: {
        deletedAt: null,
      },
    },
    include: {
      secureLink: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applicationSecureLink;
};

// Default export for backward compatibility
const applicationService = {
  getRecentApplications,
  getApplicationById,
  getApplicationCount,
  approveApplication,
  rejectApplication,
  requestMoreInfoFromApplication,
  moveApplicationToReview,
  requestApplicationInterview,
  scheduleApplicationInterview,
  markApplicationInterviewCompleted,
  createInterviewSchedulingLink,
  getInterviewSchedulingLink,
};

export default applicationService;
