import type { ContractTemplateData } from "../../types/contractTemplate.types";
import type {
  FeeStructureListItem,
  FeeStructureData,
} from "@/domains/fee-structures/types/feeStructure.types";
import type { CustomVariable } from "@/domains/custom-variables/types/customVariable.types";
import type { RefObject } from "react";

// Re-export for convenience
export type { CustomVariable } from "@/domains/custom-variables/types/customVariable.types";
export type {
  FeeStructureListItem,
  FeeStructureData,
} from "@/domains/fee-structures/types/feeStructure.types";
export type { HeaderConfig, FooterConfig } from "@/components/editor/types";
export type { ContractTemplateData } from "../../types/contractTemplate.types";

/**
 * Validation result for placeholders
 */
export type PlaceholderValidation = {
  valid: boolean;
  errors: Array<{ placeholder: string; error: string }>;
  warnings: Array<{ placeholder: string; warning: string }>;
};

/**
 * Fee structure compatibility result
 */
export type FeeStructureCompatibility = {
  compatible: boolean;
  missingVariables: string[];
} | null;

/**
 * Variable group for display
 */
export type VariableGroup = {
  namespace: string;
  vars: string[];
};

/**
 * Variable update data for CRUD operations
 */
export type VariableUpdateData = {
  key: string;
  defaultValue: string | null;
  description?: string | null;
  label?: string | null;
  variableType?: "text" | "checkbox_group";
  options?: Array<{ label: string; value: string }>;
  showUnderline?: boolean;
};

/**
 * Editor ref type - using any as TipTap editor type is complex
 */
export type EditorRef = RefObject<any>;

/**
 * Props for the main ContractTemplateEditContent component
 */
export type ContractTemplateEditContentProps = {
  template: ContractTemplateData;
};

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

/**
 * Active tab type for variables panel
 */
export type VariablesPanelTab = "variables" | "custom" | "placeholders";
