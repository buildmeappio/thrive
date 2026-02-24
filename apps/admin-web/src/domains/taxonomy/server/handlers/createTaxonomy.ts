import * as taxonomyService from '../taxonomy.service';
import { CreateTaxonomyInput, TaxonomyType } from '../../types/Taxonomy';

const createTaxonomy = async (type: TaxonomyType, data: CreateTaxonomyInput) => {
  const result = await taxonomyService.createTaxonomy(type, data);
  return { success: true, result };
};

export default createTaxonomy;
