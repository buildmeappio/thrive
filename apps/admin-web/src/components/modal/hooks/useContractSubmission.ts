'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  createContractAction,
  previewContractAction,
  sendContractAction,
  updateContractFeeStructureAction,
  getContractAction,
  updateContractFieldsAction,
} from '@/domains/contracts/actions';
import type { FeeFormValues } from '../components/FeeStructureFormStep';
import type { ContractFormValues } from '../components/ContractVariablesFormStep';
import type { ContractModalStep } from '../types/createContractModal.types';

type ContractSubmissionOptions = {
  examinerId?: string;
  applicationId?: string;
  examinerName: string;
  examinerEmail: string;
  existingContractId?: string;
  existingTemplateId?: string;
  onSuccess?: () => void;
  onClose: () => void;
};

type SubmitContractParams = {
  selectedTemplateId: string;
  selectedTemplateVersionId: string;
  selectedFeeStructureId: string;
  feeFormValues: FeeFormValues;
  contractFormValues: ContractFormValues;
};

export type UseContractSubmissionReturn = {
  contractId: string | null;
  previewHtml: string;
  isLoading: boolean;
  setContractId: (id: string | null) => void;
  setPreviewHtml: (html: string) => void;
  submitContract: (params: SubmitContractParams) => Promise<boolean>;
  sendContract: () => Promise<void>;
  resetContractState: () => void;
};

/**
 * Builds field values object from contract and fee form values.
 */
function buildFieldValues(
  contractFormValues: ContractFormValues,
  feeFormValues: FeeFormValues,
  examinerName: string,
  examinerEmail: string
): Record<string, unknown> {
  // Filter out undefined/null/empty values for contract
  const contractValues: Record<string, string> = {};
  if (contractFormValues.province && contractFormValues.province.trim()) {
    contractValues.province = contractFormValues.province.trim();
  }
  if (contractFormValues.effective_date && contractFormValues.effective_date.trim()) {
    contractValues.effective_date = contractFormValues.effective_date.trim();
  }

  // Thrive/organization values are seeded in DB and will be loaded from there

  // Process custom variable values
  const customValues: Record<string, string | string[]> = {};
  if (contractFormValues.custom) {
    for (const [key, value] of Object.entries(contractFormValues.custom)) {
      if (Array.isArray(value)) {
        // For checkbox groups, keep as array or convert to comma-separated string
        if (value.length > 0) {
          customValues[key] = value;
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        customValues[key] = value.trim();
      }
    }
  }

  return {
    examiner: {
      name: examinerName,
      email: examinerEmail,
    },
    contract: contractValues,
    // thrive values are seeded in DB and will be loaded from there
    fees_overrides: feeFormValues,
    custom: Object.keys(customValues).length > 0 ? customValues : undefined,
  };
}

/**
 * Hook for handling contract creation, update, preview, and sending.
 */
export function useContractSubmission(
  options: ContractSubmissionOptions,
  setStep: (step: ContractModalStep) => void
): UseContractSubmissionReturn {
  const {
    examinerId,
    applicationId,
    examinerName,
    examinerEmail,
    existingContractId,
    existingTemplateId,
    onSuccess,
    onClose,
  } = options;

  const [contractId, setContractId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Submits the contract (create or update) and generates preview.
   * Returns true on success, false on failure.
   */
  const submitContract = useCallback(
    async (params: SubmitContractParams): Promise<boolean> => {
      const {
        selectedTemplateId,
        selectedTemplateVersionId,
        selectedFeeStructureId,
        feeFormValues,
        contractFormValues,
      } = params;

      if (!selectedFeeStructureId) {
        toast.error('Please select a fee structure');
        return false;
      }

      setIsLoading(true);
      try {
        const templateChanged = existingContractId && existingTemplateId !== selectedTemplateId;

        const fieldValues = buildFieldValues(
          contractFormValues,
          feeFormValues,
          examinerName,
          examinerEmail
        );

        console.log(
          '[Contract Submission] Building fieldValues:',
          JSON.stringify(fieldValues, null, 2)
        );

        if (existingContractId && !templateChanged) {
          // In-place update for existing contract
          return await updateExistingContract(
            existingContractId,
            selectedFeeStructureId,
            fieldValues
          );
        } else {
          // Create new contract
          return await createNewContract(
            selectedTemplateVersionId,
            selectedFeeStructureId,
            fieldValues
          );
        }
      } catch (error) {
        console.error('Error creating contract:', error);
        toast.error('Failed to create contract');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingContractId, existingTemplateId, examinerId, applicationId, examinerName, examinerEmail]
  );

  /**
   * Updates an existing contract with new fee structure and field values.
   */
  const updateExistingContract = async (
    contractIdToUpdate: string,
    selectedFeeStructureId: string,
    fieldValues: Record<string, unknown>
  ): Promise<boolean> => {
    // Check if fee structure needs to be updated
    const contractResult = await getContractAction(contractIdToUpdate);
    const existingFeeStructureId =
      contractResult.success && contractResult.data ? contractResult.data.feeStructureId : null;

    if (selectedFeeStructureId && existingFeeStructureId !== selectedFeeStructureId) {
      const updateResult = await updateContractFeeStructureAction(
        contractIdToUpdate,
        selectedFeeStructureId
      );
      if (!updateResult.success) {
        toast.error(
          'error' in updateResult ? updateResult.error : 'Failed to update fee structure'
        );
        return false;
      }
      toast.success('Fee structure updated successfully');
    }

    // Update field values
    const updateFieldsResult = await updateContractFieldsAction({
      id: contractIdToUpdate,
      fieldValues: fieldValues,
    });
    if (!updateFieldsResult.success) {
      toast.error(
        'error' in updateFieldsResult
          ? updateFieldsResult.error
          : 'Failed to update contract values'
      );
      return false;
    }

    setContractId(contractIdToUpdate);

    // Generate preview
    return await generatePreview(contractIdToUpdate);
  };

  /**
   * Creates a new contract with the provided parameters.
   */
  const createNewContract = async (
    templateVersionId: string,
    selectedFeeStructureId: string,
    fieldValues: Record<string, unknown>
  ): Promise<boolean> => {
    const createResult = await createContractAction({
      examinerProfileId: examinerId,
      applicationId: applicationId,
      templateVersionId: templateVersionId,
      feeStructureId: selectedFeeStructureId,
      fieldValues: fieldValues,
    });

    if (!createResult.success) {
      toast.error('error' in createResult ? createResult.error : 'Failed to create contract');
      return false;
    }

    const newContractId = createResult.data.id;
    setContractId(newContractId);

    // Generate preview
    return await generatePreview(newContractId);
  };

  /**
   * Generates and loads the contract preview.
   */
  const generatePreview = async (contractIdToPreview: string): Promise<boolean> => {
    const previewResult = await previewContractAction(contractIdToPreview);
    if (previewResult.success) {
      setPreviewHtml(previewResult.data.renderedHtml);
      setStep(4);
      if (previewResult.data.missingPlaceholders.length > 0) {
        toast.warning(`Missing placeholders: ${previewResult.data.missingPlaceholders.join(', ')}`);
      }
      return true;
    } else {
      toast.error('error' in previewResult ? previewResult.error : 'Failed to preview contract');
      return false;
    }
  };

  /**
   * Sends the contract to the examiner.
   */
  const sendContract = useCallback(async () => {
    if (!contractId) return;
    setIsLoading(true);
    try {
      const sendResult = await sendContractAction(contractId);
      if (sendResult.success) {
        toast.success('Contract sent successfully');
        setStep(5);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        toast.error('error' in sendResult ? sendResult.error : 'Failed to send contract');
      }
    } catch (error) {
      console.error('Error sending contract:', error);
      toast.error('Failed to send contract');
    } finally {
      setIsLoading(false);
    }
  }, [contractId, onSuccess, onClose, setStep]);

  /**
   * Resets contract state to initial values.
   */
  const resetContractState = useCallback(() => {
    setContractId(null);
    setPreviewHtml('');
    setIsLoading(false);
  }, []);

  return {
    contractId,
    previewHtml,
    isLoading,
    setContractId,
    setPreviewHtml,
    submitContract,
    sendContract,
    resetContractState,
  };
}
