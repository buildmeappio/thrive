import * as taxonomyService from "../taxonomy.service";
import { TaxonomyType } from "../../types/Taxonomy";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";

const deleteTaxonomy = async (type: TaxonomyType, id: string) => {
  try {
    const result = await taxonomyService.deleteTaxonomy(type, id);
    return { success: true, result };
  } catch (error) {
    if (error instanceof HttpError) {
      return { success: false, error: error.message };
    }
    logger.error(`Error in deleteTaxonomy handler for ${type}:`, error);
    return { success: false, error: "Failed to delete taxonomy" };
  }
};

export default deleteTaxonomy;
