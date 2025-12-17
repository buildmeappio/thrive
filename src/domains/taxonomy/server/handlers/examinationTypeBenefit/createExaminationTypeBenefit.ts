import * as examinationTypeBenefitService from "../../examinationTypeBenefit.service";
import { CreateExaminationTypeBenefitInput } from "../../../types/ExaminationTypeBenefit";

const createExaminationTypeBenefit = async (
  data: CreateExaminationTypeBenefitInput,
) => {
  const result =
    await examinationTypeBenefitService.createExaminationTypeBenefit(data);
  return { success: true, result };
};

export default createExaminationTypeBenefit;
