'use server';

import {
  createBenefit,
  updateBenefit,
  getBenefits,
  getBenefitById,
  deleteBenefit,
} from './server/benefit.service';
import { CreateBenefitInput, UpdateBenefitInput, BenefitData } from './types/Benefit';
import { getExaminationTypes } from '@/domains/taxonomy/server/taxonomy.service';

export const createBenefitAction = async (data: CreateBenefitInput) => {
  try {
    const result = await createBenefit(data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create benefit',
    };
  }
};

export const updateBenefitAction = async (id: string, data: UpdateBenefitInput) => {
  try {
    const result = await updateBenefit(id, data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update benefit',
    };
  }
};

export const getBenefitsAction = async (): Promise<{
  success: boolean;
  data?: BenefitData[];
  error?: string;
}> => {
  try {
    const benefits = await getBenefits();
    return { success: true, data: benefits };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch benefits',
    };
  }
};

export const getBenefitByIdAction = async (id: string) => {
  try {
    const benefit = await getBenefitById(id);
    return { success: true, data: benefit };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch benefit',
    };
  }
};

export const deleteBenefitAction = async (id: string) => {
  try {
    await deleteBenefit(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete benefit',
    };
  }
};

export const getExaminationTypesAction = async () => {
  try {
    const types = await getExaminationTypes();
    return { success: true, data: types };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch examination types',
    };
  }
};
