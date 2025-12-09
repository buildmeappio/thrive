import prisma from "@/lib/db";
import { ExaminerStatus } from "@prisma/client";

const includeRelations = {
  address: true,
  resumeDocument: true,
  ndaDocument: true,
  insuranceDocument: true,
  redactedIMEReportDocument: true,
};

export const getRecentApplications = async (limit?: number, status?: string | string[]) => {
  return prisma.examinerApplication.findMany({
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

export const getApplicationById = async (id: string) => {
  return prisma.examinerApplication.findUnique({
    where: { id },
    include: includeRelations,
  });
};

export const getApplicationCount = async (status?: string | string[]) => {
  return prisma.examinerApplication.count({
    where: {
      deletedAt: null,
      ...(status && { 
        status: Array.isArray(status) 
          ? { in: status as any[] } 
          : (status as any) 
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

export const rejectApplication = async (id: string, accountId?: string, rejectionReason?: string) => {
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
  _documentsRequired: boolean
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
  return prisma.examinerApplication.update({
    where: { id },
    data: {
      status: ExaminerStatus.INTERVIEW_COMPLETED,
    },
    include: includeRelations,
  });
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
  scheduleApplicationInterview,
  markApplicationInterviewCompleted,
};

export default applicationService;

