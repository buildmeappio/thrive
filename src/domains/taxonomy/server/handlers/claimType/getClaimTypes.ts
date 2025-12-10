import * as claimTypeService from '../../claimType.service';

const getClaimTypes = async () => {
  const result = await claimTypeService.getClaimTypes();
  return { success: true, result };
};

export default getClaimTypes;

