'use server';

import { taxonomyHandlers } from './server';
import { getCurrentUser } from '../auth/server/session';
import { redirect } from 'next/navigation';
import { CreateTaxonomyInput, UpdateTaxonomyInput, TaxonomyType } from './types/Taxonomy';
import { URLS } from '@/constants/route';

export const createTaxonomy = async (type: TaxonomyType, data: CreateTaxonomyInput) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await taxonomyHandlers.createTaxonomy(type, data);
  return result;
};

export const updateTaxonomy = async (type: TaxonomyType, id: string, data: UpdateTaxonomyInput) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await taxonomyHandlers.updateTaxonomy(type, id, data);
  return result;
};

export const getTaxonomies = async (type: TaxonomyType) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await taxonomyHandlers.getTaxonomies(type);
  return result;
};

export const getTaxonomyById = async (type: TaxonomyType, id: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await taxonomyHandlers.getTaxonomyById(type, id);
  return result;
};

export const getExaminationTypes = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await taxonomyHandlers.getExaminationTypes();
  return result;
};

export const deleteTaxonomy = async (type: TaxonomyType, id: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await taxonomyHandlers.deleteTaxonomy(type, id);
  return result;
};
