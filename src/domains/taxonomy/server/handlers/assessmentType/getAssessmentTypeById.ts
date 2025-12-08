import assessmentTypeService from '../../assessmentType.service';

const getAssessmentTypeById = async (id: string) => {
  const result = await assessmentTypeService.getAssessmentTypeById(id);
  return { success: true, result };
};

export default getAssessmentTypeById;

