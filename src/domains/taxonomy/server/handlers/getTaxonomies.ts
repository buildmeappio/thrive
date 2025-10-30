import taxonomyService from '../taxonomy.service';
import { TaxonomyType } from '../../types/Taxonomy';

const getTaxonomies = async (type: TaxonomyType) => {
  const result = await taxonomyService.getTaxonomies(type);
  return { success: true, result };
};

export default getTaxonomies;

