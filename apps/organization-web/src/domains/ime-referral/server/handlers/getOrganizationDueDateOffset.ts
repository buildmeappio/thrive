import configurationService from '@/services/configuration.service';

const getOrganizationDueDateOffset = async (): Promise<number> => {
  const dueDateOffset = await configurationService.getOrganizationDueDateOffset();
  return dueDateOffset;
};

export default getOrganizationDueDateOffset;
