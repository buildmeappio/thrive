import prisma from '@/lib/db';
import HttpError from '@/utils/httpError';

class AssessmentTypeService {
  async getAssessmentTypes() {
    try {
      const assessmentTypes = await prisma.assessmentType.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return assessmentTypes;
    } catch (error) {
      throw HttpError.fromError(error, 'Failed to fetch assessment types', 500);
    }
  }
}

export default new AssessmentTypeService();
