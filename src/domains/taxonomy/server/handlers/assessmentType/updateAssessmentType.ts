import * as assessmentTypeService from "../../assessmentType.service";
import { UpdateTaxonomyInput } from "../../../types/Taxonomy";

const updateAssessmentType = async (id: string, data: UpdateTaxonomyInput) => {
  const result = await assessmentTypeService.updateAssessmentType(id, {
    name: data.name as string | undefined,
    description: data.description as string | null | undefined,
  });
  return { success: true, result };
};

export default updateAssessmentType;
