import * as taxonomyService from "../taxonomy.service";

const getExaminationTypes = async () => {
  const result = await taxonomyService.getExaminationTypes();
  return { success: true, result };
};

export default getExaminationTypes;
