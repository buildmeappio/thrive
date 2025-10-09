import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import { ExaminerStatus } from "@prisma/client";

class ExaminerService {
  async getExaminerProfileById(examinerProfileId: string) {
    try {
      const examinerProfile = await prisma.examinerProfile.findUnique({
        where: {
          id: examinerProfileId,
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!examinerProfile) {
        throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
      }

      return examinerProfile;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.FAILED_FETCH_EXAMINER_PROFILE, 500);
    }
  }

  async updateExaminerStatus(
    examinerProfileId: string,
    status: ExaminerStatus,
    approvedBy?: string
  ) {
    try {
      const updateData: {
        status: ExaminerStatus;
        approvedBy?: string | null;
        approvedAt?: Date;
        rejectedBy?: string | null;
        rejectedAt?: Date;
      } = {
        status,
      };

      if (status === ExaminerStatus.ACCEPTED) {
        updateData.approvedBy = approvedBy || null;
        updateData.approvedAt = new Date();
      } else if (status === ExaminerStatus.REJECTED) {
        updateData.rejectedBy = approvedBy || null;
        updateData.rejectedAt = new Date();
      }

      const updatedProfile = await prisma.examinerProfile.update({
        where: {
          id: examinerProfileId,
        },
        data: updateData,
      });

      return updatedProfile;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_UPDATE_EXAMINER_STATUS,
        500
      );
    }
  }

  validateExaminerStatus(status: ExaminerStatus, action: "approve" | "reject") {
    if (action === "approve") {
      if (status === ExaminerStatus.ACCEPTED) {
        throw HttpError.badRequest(ErrorMessages.EXAMINER_ALREADY_APPROVED);
      }
      if (status === ExaminerStatus.REJECTED) {
        throw HttpError.badRequest(ErrorMessages.CANNOT_APPROVE_REJECTED_EXAMINER);
      }
    } else if (action === "reject") {
      if (status === ExaminerStatus.REJECTED) {
        throw HttpError.badRequest(ErrorMessages.EXAMINER_ALREADY_REJECTED);
      }
    }
  }
}

export default new ExaminerService();
