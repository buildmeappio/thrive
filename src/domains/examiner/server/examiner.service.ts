import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import { startOfMonth, endOfMonth } from "date-fns";
import { ExaminerStatus } from "@prisma/client";
import logger from "@/utils/logger";

class ExaminerService {
  // Get count of examiners created this month with specific status
  async getExaminerCountThisMonth(status: ExaminerStatus = "PENDING"): Promise<number> {
    const now = new Date();
    const [from, to] = [startOfMonth(now), endOfMonth(now)];
    
    try {
      return await prisma.examinerProfile.count({
        where: {
          createdAt: { gte: from, lte: to },
          status,
          deletedAt: null,
        },
      });
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get examiner count");
    }
  }

  // Get recent examiners with full details
  async getRecentExaminers(
    limit = 7, 
    status: ExaminerStatus = "PENDING"
  ) {
    try {
      const examiners = await prisma.examinerProfile.findMany({
        where: {
          status,
          deletedAt: null,
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
          address: true,
          resumeDocument: true,
          ndaDocument: true,
          insuranceDocument: true,
          redactedIMEReportDocument: true,
          examinerLanguages: {
            include: {
              language: true,
            },
          },
          feeStructure: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      
      // Filter out examiners with missing user data
      // Note: Documents can be optional as the DTO will handle missing documents
      return examiners.filter(examiner => examiner.account?.user);
    } catch (error) {
      logger.error("Error fetching recent examiners:", error);
      throw HttpError.fromError(error, "Failed to get recent examiners");
    }
  }

  // Get examiner by ID (for future detail page)
  async getExaminerById(id: string) {
    try {
      const examiner = await prisma.examinerProfile.findUnique({
        where: { id },
        include: {
          account: {
            include: {
              user: true,
            },
          },
          address: true,
          resumeDocument: true,
          ndaDocument: true,
          insuranceDocument: true,
          redactedIMEReportDocument: true,
          examinerLanguages: {
            include: {
              language: true,
            },
          },
          feeStructure: {
            where: {
              deletedAt: null,
            },
          },
          contracts: {
            where: {
              status: 'SIGNED',
            },
            orderBy: {
              signedAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!examiner) {
        throw HttpError.notFound("Examiner not found");
      }

      return examiner;
    } catch (error) {
      logger.error("Database error in getExaminerById:", error);
      throw HttpError.fromError(error, "Failed to get examiner");
    }
  }

  // Approve an examiner
  async approveExaminer(id: string, approvedBy: string) {
    try {
      const examiner = await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy,
          approvedAt: new Date(),
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
          address: true,
          resumeDocument: true,
          ndaDocument: true,
          insuranceDocument: true,
          redactedIMEReportDocument: true,
          examinerLanguages: {
            include: {
              language: true,
            },
          },
        },
      });

      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to approve examiner");
    }
  }

  // Reject an examiner
  async rejectExaminer(id: string, rejectedBy: string, rejectionReason: string) {
    if (!rejectionReason?.trim()) {
      throw HttpError.badRequest("Rejection reason is required");
    }

    try {
      const examiner = await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedBy,
          rejectedAt: new Date(),
          rejectedReason: rejectionReason.trim(),
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
          address: true,
          resumeDocument: true,
          ndaDocument: true,
          insuranceDocument: true,
          redactedIMEReportDocument: true,
          examinerLanguages: {
            include: {
              language: true,
            },
          },
        },
      });

      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to reject examiner");
    }
  }

  // Request more info from examiner (change status to INFO_REQUESTED)
  async requestMoreInfoFromExaminer(id: string) {
    try {
      const examiner = await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: "MORE_INFO_REQUESTED",
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
          address: true,
          resumeDocument: true,
          ndaDocument: true,
          insuranceDocument: true,
          redactedIMEReportDocument: true,
          examinerLanguages: {
            include: {
              language: true,
            },
          },
        },
      });

      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to update examiner status");
    }
  }

  // Move examiner to review (SUBMITTED/PENDING → IN_REVIEW)
  async moveToReview(id: string) {
    try {
      const examiner = await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: "IN_REVIEW",
        },
      });
      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to move examiner to review");
    }
  }

  // Schedule interview (IN_REVIEW → INTERVIEW_SCHEDULED)
  async scheduleInterview(id: string) {
    try {
      const examiner = await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: "INTERVIEW_SCHEDULED",
        },
      });
      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to schedule interview");
    }
  }

  // Mark interview as completed (INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED)
  async markInterviewCompleted(id: string) {
    try {
      const examiner = await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: "INTERVIEW_COMPLETED",
        },
      });
      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to mark interview as completed");
    }
  }

  // Mark contract as signed (CONTRACT_SENT → CONTRACT_SIGNED)
  // Admin confirms the examiner's signature
  async markContractSigned(id: string) {
    try {
      const examiner = await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: "CONTRACT_SIGNED",
          contractConfirmedByAdminAt: new Date(),
        },
      });
      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to mark contract as signed");
    }
  }
}

const examinerService = new ExaminerService();
export default examinerService;

