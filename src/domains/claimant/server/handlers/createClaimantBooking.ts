import claimantService from '../claimant.service';
import type { CreateClaimantBookingData } from '../../types/claimantAvailability';

const createClaimantBooking = async (data: CreateClaimantBookingData) => {
  const result = await claimantService.createClaimantBooking(data);
  return result;
};

export default createClaimantBooking;
