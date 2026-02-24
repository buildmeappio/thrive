'use server';

import applicationService from '../server/application.service';

const getApplicationCount = async (): Promise<number> => {
  // Count only applications from SUBMITTED/PENDING onwards (exclude DRAFT)
  return applicationService.getApplicationCount([
    'SUBMITTED',
    'PENDING',
    'IN_REVIEW',
    'MORE_INFO_REQUESTED',
    'INTERVIEW_REQUESTED',
    'INTERVIEW_SCHEDULED',
    'INTERVIEW_COMPLETED',
    'CONTRACT_SENT',
    'CONTRACT_SIGNED',
    'APPROVED',
  ]);
};

export default getApplicationCount;
