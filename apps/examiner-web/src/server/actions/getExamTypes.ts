'use server';

import getExamTypes from '../handlers/getExamTypes';
import { ExamTypesResponse } from '../types/examTypes';

const getExamTypesAction = async (): Promise<ExamTypesResponse> => {
  try {
    const result = await getExamTypes();
    return result;
  } catch (error: unknown) {
    console.error('Error in getExamTypes action:', error);
    return {
      success: false as const,
      message:
        (error instanceof Error ? error.message : undefined) ||
        'Failed to fetch exam types. Please try again.',
    };
  }
};

export default getExamTypesAction;
