import * as claimTypeService from '../../claimType.service';
import { CreateClaimTypeInput } from '../../../types/ClaimType';

const createClaimType = async (data: CreateClaimTypeInput) => {
  const result = await claimTypeService.createClaimType(data);
  return { success: true, result };
};

export default createClaimType;
