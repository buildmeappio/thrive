'use server';

import authHandlers from '../server/handlers';
import { UpdateExaminerApplicationInput } from '../server/handlers/updateExaminerApplication';

const updateExaminerApplication = async (input: UpdateExaminerApplicationInput) => {
  try {
    const result = await authHandlers.updateExaminerApplication(input);
    return result;
  } catch (error) {
    console.error('Error updating examiner application:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update application',
    };
  }
};

export default updateExaminerApplication;
