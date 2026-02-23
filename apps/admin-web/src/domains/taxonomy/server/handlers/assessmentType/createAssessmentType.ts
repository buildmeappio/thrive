import * as assessmentTypeService from "../../assessmentType.service";
import { CreateTaxonomyInput } from "../../../types/Taxonomy";

const createAssessmentType = async (data: CreateTaxonomyInput) => {
  const result = await assessmentTypeService.createAssessmentType({
    name: data.name as string,
    description: data.description as string | null,
  });
  return { success: true, result };
};

export default createAssessmentType;
