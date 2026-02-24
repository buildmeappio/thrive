'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getFeeStructureAction } from '@/domains/fee-structures/actions/getFeeStructure';
import { FeeStructureData } from '@/domains/fee-structures/types/feeStructure.types';
import { initializeFeeFormValues } from '../components/FeeStructureFormStep';
import type { FeeFormValues } from '../components/FeeStructureFormStep';
import type { FeeStructureFullData } from '../types/createContractModal.types';

export type UseFeeStructureLoaderReturn = {
  feeStructureData: FeeStructureFullData | null;
  feeFormValues: FeeFormValues;
  isLoadingFeeStructure: boolean;
  setFeeFormValues: (values: FeeFormValues) => void;
  loadFeeStructureData: (feeStructureId: string, existingValues?: FeeFormValues) => Promise<void>;
  resetFeeStructureState: () => void;
};

/**
 * Transforms backend fee structure data to the form value model.
 */
function transformFeeStructureData(data: FeeStructureData | null): FeeStructureFullData | null {
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    variables: data.variables.map(v => ({
      id: v.id,
      key: v.key,
      label: v.label,
      type: v.type,
      defaultValue: v.defaultValue,
      required: v.required,
      currency: v.currency,
      decimals: v.decimals,
      unit: v.unit,
      sortOrder: v.sortOrder,
      included: v.included,
      composite: v.composite,
      subFields: v.subFields,
      referenceKey: v.referenceKey,
    })),
  };
}

/**
 * Hook for loading and managing fee structure data.
 * Handles fetching fee structure details and initializing form values.
 */
export function useFeeStructureLoader(): UseFeeStructureLoaderReturn {
  const [feeStructureData, setFeeStructureData] = useState<FeeStructureFullData | null>(null);
  const [feeFormValues, setFeeFormValues] = useState<FeeFormValues>({});
  const [isLoadingFeeStructure, setIsLoadingFeeStructure] = useState(false);

  /**
   * Loads fee structure meta+variables, prepopulating override values if provided.
   * Used for both new contracts and draft contract editing.
   */
  const loadFeeStructureData = useCallback(
    async (feeStructureId: string, existingValues?: FeeFormValues) => {
      if (!feeStructureId) {
        setFeeStructureData(null);
        setFeeFormValues({});
        return;
      }

      setIsLoadingFeeStructure(true);
      try {
        const result = await getFeeStructureAction(feeStructureId);
        if ('error' in result) {
          return;
        }
        if (result.data) {
          const data = transformFeeStructureData(result.data);
          if (data) {
            setFeeStructureData(data);

            // Initialize form values: use existing values if provided, otherwise defaults
            if (existingValues && Object.keys(existingValues).length > 0) {
              const initialValues: FeeFormValues = {};
              for (const variable of data.variables) {
                // Always set included variables to "included"
                if (variable.included) {
                  initialValues[variable.key] = 'included';
                } else if (existingValues[variable.key] !== undefined) {
                  initialValues[variable.key] = existingValues[variable.key];
                } else if (variable.defaultValue !== null && variable.defaultValue !== undefined) {
                  initialValues[variable.key] = variable.defaultValue;
                }
              }
              setFeeFormValues(initialValues);
            } else {
              setFeeFormValues(initializeFeeFormValues(data.variables));
            }
          }
        }
      } catch (error) {
        console.error('Error loading fee structure:', error);
        toast.error('Failed to load fee structure details');
      } finally {
        setIsLoadingFeeStructure(false);
      }
    },
    []
  );

  /**
   * Resets fee structure state to initial values.
   */
  const resetFeeStructureState = useCallback(() => {
    setFeeStructureData(null);
    setFeeFormValues({});
    setIsLoadingFeeStructure(false);
  }, []);

  return {
    feeStructureData,
    feeFormValues,
    isLoadingFeeStructure,
    setFeeFormValues,
    loadFeeStructureData,
    resetFeeStructureState,
  };
}
