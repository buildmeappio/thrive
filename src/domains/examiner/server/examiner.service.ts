import prisma from "@/lib/db";
import { ExaminerStatus } from "@prisma/client";

const includeRelations = {
  account: {
    include: {
      user: true,
    },
  },
  feeStructure: true,
  address: true,
  redactedIMEReportDocument: true,
  resumeDocument: true,
  ndaDocument: true,
  insuranceDocument: true,
  examinerLanguages: {
    include: {
      language: true,
    },
  },
};

export const getRecentExaminers = async (limit?: number, status?: string | string[]) => {
  return prisma.examinerProfile.findMany({
    where: {
      deletedAt: null,
      ...(status && { 
        status: Array.isArray(status) 
          ? { in: status as any[] } 
          : (status as any) 
      }),
    },
    include: includeRelations,
    orderBy: {
      createdAt: "desc",
    },
    take: limit || 10,
  });
};

export const getExaminerById = async (id: string) => {
  return prisma.examinerProfile.findUnique({
    where: { id },
    include: includeRelations,
  });
};

export const approveExaminer = async (id: string, accountId?: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.APPROVED,
    },
    include: includeRelations,
  });
};

export const rejectExaminer = async (id: string, accountId?: string, rejectionReason?: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.REJECTED,
      rejectedReason: rejectionReason,
    },
    include: includeRelations,
  });
};

export const requestMoreInfoFromExaminer = async (
  id: string,
  message: string,
  documentsRequired: boolean
) => {
  // Note: message and documentsRequired are sent via email but not stored in DB
  // as these fields don't exist in the schema
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.MORE_INFO_REQUESTED,
    },
    include: includeRelations,
  });
};

// New status transition methods
export const moveToReview = async (id: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.IN_REVIEW,
    },
    include: includeRelations,
  });
};

export const scheduleInterview = async (id: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.INTERVIEW_SCHEDULED,
    },
    include: includeRelations,
  });
};

export const markInterviewCompleted = async (id: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.INTERVIEW_COMPLETED,
    },
    include: includeRelations,
  });
};

export const markContractSigned = async (id: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.CONTRACT_SIGNED,
      contractConfirmedByAdminAt: new Date(),
    },
    include: includeRelations,
  });
};

// Suspend and reactivate methods
export const suspendExaminer = async (id: string, suspensionReason?: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.SUSPENDED,
      rejectedReason: suspensionReason, // Reuse this field for suspension reason
    },
    include: includeRelations,
  });
};

export const reactivateExaminer = async (id: string) => {
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.APPROVED, // Return to APPROVED status
      rejectedReason: null, // Clear any suspension reason
    },
    include: includeRelations,
  });
};

// Export for getExaminerCountThisMonth used by handlers
export const getExaminerCountThisMonth = async (status: string | string[]) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.examinerProfile.count({
    where: {
      status: Array.isArray(status) 
        ? { in: status as any[] } 
        : (status as any),
      createdAt: {
        gte: startOfMonth,
      },
      deletedAt: null,
    },
  });
};

// Default export for backward compatibility
const examinerService = {
  getRecentExaminers,
  getExaminerById,
  approveExaminer,
  rejectExaminer,
  requestMoreInfoFromExaminer,
  moveToReview,
  scheduleInterview,
  markInterviewCompleted,
  markContractSigned,
  suspendExaminer,
  reactivateExaminer,
  getExaminerCountThisMonth,
};

export default examinerService;
