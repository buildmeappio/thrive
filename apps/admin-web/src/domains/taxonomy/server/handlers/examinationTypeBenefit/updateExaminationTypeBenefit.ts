import * as examinationTypeBenefitService from "../../examinationTypeBenefit.service";
import { UpdateExaminationTypeBenefitInput } from "../../../types/ExaminationTypeBenefit";

const updateExaminationTypeBenefit = async (
  id: string,
  data: UpdateExaminationTypeBenefitInput,
) => {
  const result =
    await examinationTypeBenefitService.updateExaminationTypeBenefit(id, data);
  return { success: true, result };
};

export default updateExaminationTypeBenefit;
