import * as taxonomyService from '../taxonomy.service';
import * as assessmentTypeService from '../assessmentType.service';
import { TaxonomyType } from '../../types/Taxonomy';

const getTaxonomies = async (type: TaxonomyType) => {
  // Use custom service for assessmentType to get frequency calculation
  if (type === 'assessmentType') {
    const result = await assessmentTypeService.getAssessmentTypes();
    return { success: true, result };
  }

  const result = await taxonomyService.getTaxonomies(type);
  return { success: true, result };
};

export default getTaxonomies;
