import type { FeeFormValues, FeeVariable } from '../components/FeeStructureFormStep';
import type { ContractFormValues } from '../components/ContractVariablesFormStep';
import type { CustomVariable } from '@/domains/custom-variables/types/customVariable.types';
import { FooterConfig, HeaderConfig } from '@/components/editor/types';

export type CreateContractModalProps = {
  open: boolean;
  onClose: () => void;
  examinerId?: string;
  applicationId?: string;
  examinerName: string;
  examinerEmail: string;
  onSuccess?: () => void;
  existingContractId?: string; // For resending - existing contract ID
  existingTemplateId?: string; // For resending - existing template ID
};

export type UseCreateContractModalOptions = CreateContractModalProps;

/**
 * Step definitions:
 * 1 - Select Template & Fee Structure
 * 2 - Fill Fee Structure Form
 * 3 - Fill Contract Variables Form
 * 4 - Preview Contract
 * 5 - Contract Sent (Success)
 */
export type ContractModalStep = 1 | 2 | 3 | 4 | 5;

export type FeeStructureFullData = {
  id: string;
  name: string;
  description: string | null;
  variables: FeeVariable[];
};

export type UseCreateContractModalReturn = {
  // Props
  open: boolean;
  onClose: () => void;

  // State
  step: ContractModalStep;
  templates: Array<{
    id: string;
    displayName: string;
    currentVersion: { version: number } | null;
  }>;
  selectedTemplateId: string;
  selectedTemplateContent: string | null;
  selectedTemplateHeaderContent: HeaderConfig | null;
  selectedTemplateFooterContent: FooterConfig | null;
  compatibleFeeStructures: Array<{ id: string; name: string }>;
  selectedFeeStructureId: string;
  isLoading: boolean;
  isLoadingData: boolean;
  isLoadingTemplate: boolean;
  isLoadingFeeStructure: boolean;
  previewHtml: string;
  contractId: string | null;
  selectedTemplate:
    | {
        id: string;
        displayName: string;
        currentVersion: { version: number } | null;
        currentVersionId: string | null;
      }
    | undefined;

  // Fee Structure Form State
  feeStructureData: FeeStructureFullData | null;
  feeFormValues: FeeFormValues;
  requiresFeeStructure: boolean;

  // Contract Variables Form State
  contractFormValues: ContractFormValues;
  customVariables: CustomVariable[];

  // Actions
  setSelectedTemplateId: (id: string) => void;
  setSelectedFeeStructureId: (id: string) => void;
  setStep: (step: ContractModalStep) => void;
  setFeeFormValues: (values: FeeFormValues) => void;
  setContractFormValues: (values: ContractFormValues) => void;
  handleContinueToFeeForm: () => void;
  handleFeeFormSubmit: () => Promise<void>;
  handleContractFormSubmit: () => Promise<void>;
  handleSendContract: () => Promise<void>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  titleId: string;
  onBackdrop: (e: React.MouseEvent) => void;
};
