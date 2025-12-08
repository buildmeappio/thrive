import assessmentTypeService from '../../assessmentType.service';

const getAssessmentTypes = async () => {
  const result = await assessmentTypeService.getAssessmentTypes();
  return { success: true, result };
};

export default getAssessmentTypes;

