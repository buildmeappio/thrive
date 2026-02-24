import type { CustomVariable } from '@/domains/custom-variables/types/customVariable.types';
import type {
  FeeStructureListItem,
  FeeStructureData,
} from '@/domains/fee-structures/types/feeStructure.types';
import type { VariableGroup, VariablesPanelTab } from './variables.types';
import type { PlaceholderValidation, FeeStructureCompatibility } from './validation.types';
import type { VariableUpdateData } from './variables.types';

/**
 * Variables hook return type
 */
export type UseVariablesReturn = {
  systemVariables: CustomVariable[];
  customVariables: CustomVariable[];
  isLoadingVariables: boolean;
  editingVariable: CustomVariable | null;
  isVariableDialogOpen: boolean;
  isUpdatingVariable: boolean;
  isCreatingVariable: boolean;
  setEditingVariable: (variable: CustomVariable | null) => void;
  setIsVariableDialogOpen: (open: boolean) => void;
  handleVariableUpdate: (data: VariableUpdateData) => Promise<void>;
};

/**
 * Fee structures hook return type
 */
export type UseFeeStructuresReturn = {
  feeStructures: FeeStructureListItem[];
  selectedFeeStructureId: string;
  selectedFeeStructureData: FeeStructureData | null;
  isLoadingFeeStructures: boolean;
  isUpdatingFeeStructure: boolean;
  feeStructureCompatibility: FeeStructureCompatibility;
  setSelectedFeeStructureId: (id: string) => void;
  handleFeeStructureChange: (feeStructureId: string) => Promise<void>;
};

/**
 * Google Docs sync hook return type
 */
export type UseGoogleDocsSyncReturn = {
  googleDocUrl: string | null;
  isLoadingGoogleDocUrl: boolean;
  isSyncingFromGDocs: boolean;
  showSyncConfirmDialog: boolean;
  setGoogleDocUrl: (url: string | null) => void;
  setShowSyncConfirmDialog: (show: boolean) => void;
  handleSyncFromGoogleDocsClick: () => void;
  handleConfirmSyncFromGoogleDocs: () => Promise<void>;
};

/**
 * Placeholders hook return type
 */
export type UsePlaceholdersReturn = {
  placeholders: string[];
  validation: PlaceholderValidation;
  availableVariables: VariableGroup[];
  validVariablesSet: Set<string>;
  variableValuesMap: Map<string, string>;
  insertPlaceholder: (placeholder: string) => void;
};

/**
 * Template save hook return type
 */
export type UseTemplateSaveReturn = {
  isSaving: boolean;
  handleSave: () => Promise<void>;
};
