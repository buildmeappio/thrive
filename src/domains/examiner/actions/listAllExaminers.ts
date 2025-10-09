"use server";
import prisma from "@/lib/db";
import { ExaminerDto } from "../server/dto/examiner.dto";
import { HttpError } from "@/utils/httpError";

const listAllExaminers = async () => {
  try {
    // Get ALL examiners regardless of status (PENDING, ACCEPTED, REJECTED)
    const examiners = await prisma.examinerProfile.findMany({
      where: {
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
    });

    // Filter out examiners with missing user data
    const validExaminers = examiners.filter(examiner => examiner.account?.user);
    
    return ExaminerDto.toExaminerDataList(validExaminers);
  } catch (error) {
    console.error("Error fetching all examiners:", error);
    throw HttpError.fromError(error, "Failed to get examiners");
  }
};

export default listAllExaminers;

