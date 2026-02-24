import * as taxonomyService from '../taxonomy.service';
import { TaxonomyType } from '../../types/Taxonomy';

const getTaxonomyById = async (type: TaxonomyType, id: string) => {
  const result = await taxonomyService.getTaxonomyById(type, id);
  return { success: true, result };
};

export default getTaxonomyById;
