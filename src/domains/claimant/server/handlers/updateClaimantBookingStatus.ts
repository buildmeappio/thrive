import claimantService from '../claimant.service';
import type { UpdateClaimantBookingStatusData } from '../../types/claimantAvailability';

const updateClaimantBookingStatus = async (data: UpdateClaimantBookingStatusData) => {
  const result = await claimantService.updateClaimantBookingStatus(data);
  return result;
};

export default updateClaimantBookingStatus;
