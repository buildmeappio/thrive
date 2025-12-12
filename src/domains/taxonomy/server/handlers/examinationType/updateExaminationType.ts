import * as examinationTypeService from "../../examinationType.service";
import { UpdateExaminationTypeInput } from "../../../types/ExaminationType";

const updateExaminationType = async (
  id: string,
  data: UpdateExaminationTypeInput,
) => {
  const result = await examinationTypeService.updateExaminationType(id, data);
  return { success: true, result };
};

export default updateExaminationType;
