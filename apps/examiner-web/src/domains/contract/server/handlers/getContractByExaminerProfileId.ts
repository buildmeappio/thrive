'use server';

import { getContractByExaminerProfileIdService } from '../services/getContractByExaminerProfileId.service';

export async function getContractByExaminerProfileIdHandler(profileId: string) {
  try {
    return await getContractByExaminerProfileIdService(profileId);
  } catch (error) {
    console.error('Error in getContractByExaminerProfileId:', error);
    return null;
  }
}
