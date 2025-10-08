import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import { startOfMonth, endOfMonth } from "date-fns";
import { ExaminerStatus } from "@prisma/client";

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
          medicalLicenseDocument: true,
          resumeDocument: true,
          ndaDocument: true,
          insuranceDocument: true,
          examinerLanguages: {
            include: {
              language: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      
      // Filter out examiners with missing required documents to prevent errors
      return examiners.filter(examiner => 
        examiner.account?.user &&
        examiner.medicalLicenseDocument &&
        examiner.resumeDocument &&
        examiner.ndaDocument &&
        examiner.insuranceDocument
      );
    } catch (error) {
      console.error("Error fetching recent examiners:", error);
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
          medicalLicenseDocument: true,
          resumeDocument: true,
          ndaDocument: true,
          insuranceDocument: true,
          examinerLanguages: {
            include: {
              language: true,
            },
          },
        },
      });

      if (!examiner) {
        throw HttpError.notFound("Examiner not found");
      }

      return examiner;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get examiner");
    }
  }
}

const examinerService = new ExaminerService();
export default examinerService;

