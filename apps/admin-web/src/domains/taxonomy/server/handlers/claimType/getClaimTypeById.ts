import * as claimTypeService from '../../claimType.service';

const getClaimTypeById = async (id: string) => {
  const result = await claimTypeService.getClaimTypeById(id);
  return { success: true, result };
};

export default getClaimTypeById;
