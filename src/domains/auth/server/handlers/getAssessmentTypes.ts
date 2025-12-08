import { assessmentTypeService } from "../services";

const getAssessmentTypes = async () => {
  const assessmentTypes = await assessmentTypeService.getAssessmentTypes();
  return assessmentTypes;
};

export default getAssessmentTypes;

