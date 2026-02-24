import examTypeService from '../services/examType.service';
import { ExamTypesSuccessResponse } from '../types/examTypes';

const getExamTypes = async (): Promise<ExamTypesSuccessResponse> => {
  try {
    const examTypes = await examTypeService.getExamTypes();

    return {
      success: true as const,
      data: examTypes,
    };
  } catch (error) {
    throw error;
  }
};

export default getExamTypes;
