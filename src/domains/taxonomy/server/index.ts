import createTaxonomy from './handlers/createTaxonomy';
import updateTaxonomy from './handlers/updateTaxonomy';
import getTaxonomies from './handlers/getTaxonomies';
import getTaxonomyById from './handlers/getTaxonomyById';
import getExaminationTypes from './handlers/getExaminationTypes';

export const taxonomyHandlers = {
  createTaxonomy,
  updateTaxonomy,
  getTaxonomies,
  getTaxonomyById,
  getExaminationTypes,
};
