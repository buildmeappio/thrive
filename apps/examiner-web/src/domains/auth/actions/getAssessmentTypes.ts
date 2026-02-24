'use server';

import authHandlers from '../server/handlers';

const getAssessmentTypes = async () => {
  try {
    const assessmentTypes = await authHandlers.getAssessmentTypes();
    return assessmentTypes;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch assessment types');
  }
};

export default getAssessmentTypes;
