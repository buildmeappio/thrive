import * as taxonomyService from "../taxonomy.service";
import { UpdateTaxonomyInput, TaxonomyType } from "../../types/Taxonomy";

const updateTaxonomy = async (
  type: TaxonomyType,
  id: string,
  data: UpdateTaxonomyInput,
) => {
  const result = await taxonomyService.updateTaxonomy(type, id, data);
  return { success: true, result };
};

export default updateTaxonomy;
