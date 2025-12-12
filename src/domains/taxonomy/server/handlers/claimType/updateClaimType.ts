import * as claimTypeService from "../../claimType.service";
import { UpdateClaimTypeInput } from "../../../types/ClaimType";

const updateClaimType = async (id: string, data: UpdateClaimTypeInput) => {
  const result = await claimTypeService.updateClaimType(id, data);
  return { success: true, result };
};

export default updateClaimType;
