import { type CreateClaimantAvailabilityData } from '../../types/claimantAvailability';
import claimantService from '../claimant.service';

const createClaimantAvailability = async (data: CreateClaimantAvailabilityData) => {
  const claimantAvailability = await claimantService.createClaimantAvailability(data);
  return { result: claimantAvailability, success: true };
};
export default createClaimantAvailability;
