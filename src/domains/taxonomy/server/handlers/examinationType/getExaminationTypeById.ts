import * as examinationTypeService from "../../examinationType.service";

const getExaminationTypeById = async (id: string) => {
  const result = await examinationTypeService.getExaminationTypeById(id);
  return { success: true, result };
};

export default getExaminationTypeById;
