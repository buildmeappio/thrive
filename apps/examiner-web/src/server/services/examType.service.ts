import prisma from '@/lib/db';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';
import { ExamType } from '@/server/types/examTypes';

class ExamTypeService {
  async getExamTypes(): Promise<ExamType[]> {
    try {
      const examTypes = await prisma.examinationType.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return examTypes;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.EXAM_TYPES_NOT_FOUND, 500);
    }
  }
}

export default new ExamTypeService();
