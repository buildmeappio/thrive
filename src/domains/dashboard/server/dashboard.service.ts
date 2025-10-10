import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

// type CaseStatus = 'NEW' | 'IN_PROGRESS' | 'MORE_INFO_REQUESTED';

const getDashboardCases = async (status?: string) => {
  try {
    const examinations = await prisma.examination.findMany({
      where: status ? { status: { name: status } } : undefined,
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        case: {
          include: {
            claimant: {
              include: {
                claimType: true,
              },
            },
          },
        },
        examinationType: true,
        examiner: {
          include: {
            user: true,
          },
        },
      },
    });

    const caseData = examinations.map(exam => ({
      id: exam.id,
      number: exam.caseNumber,
      claimant: `${exam.case.claimant.firstName} ${exam.case.claimant.lastName}`,
      claimType: exam.case.claimant.claimType.name,
      examiner: exam.examiner && `${exam.examiner.user.firstName} ${exam.examiner.user.lastName}`,

      specialty: exam.examinationType.name,
      submittedAt: exam.createdAt,
    }));

    if (!caseData || caseData.length === 0) {
      throw HttpError.notFound(ErrorMessages.CASES_NOT_FOUND);
    }

    return caseData;
  } catch (error) {
    throw HttpError.handleServiceError(error, ErrorMessages.FAILED_TO_GET_CASE_LIST);
  }
};

const dashboardService = {
  getDashboardCases,
};

export default dashboardService;
