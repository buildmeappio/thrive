import type { CustomVariable } from "@/domains/custom-variables/types/customVariable.types";
import type {
  FeeStructureListItem,
  FeeStructureData,
} from "@/domains/fee-structures/types/feeStructure.types";
import type {
  FeeStructureCompatibility,
  PlaceholderValidation,
} from "./validation.types";
import type { VariableGroup, VariablesPanelTab } from "./variables.types";

export type VariablesPanelProps = {
  placeholders: string[];
  validation: PlaceholderValidation;
  availableVariables: VariableGroup[];
  validVariablesSet: Set<string>;
  systemVariables: CustomVariable[];
  customVariables: CustomVariable[];
  feeStructures: FeeStructureListItem[];
  selectedFeeStructureId: string;
  selectedFeeStructureData: FeeStructureData | null;
  isLoadingFeeStructures: boolean;
  isUpdatingFeeStructure: boolean;
  feeStructureCompatibility: FeeStructureCompatibility;
  content: string;
  onFeeStructureChange: (feeStructureId: string) => void;
  onInsertPlaceholder: (placeholder: string) => void;
  onEditVariable: (variable: CustomVariable) => void;
  onAddCustomVariable: () => void;
};

export type VariablesTabContentProps = {
  availableVariables: VariableGroup[];
  systemVariables: CustomVariable[];
  customVariables: CustomVariable[];
  feeStructures: FeeStructureListItem[];
  selectedFeeStructureId: string;
  selectedFeeStructureData: FeeStructureData | null;
  isLoadingFeeStructures: boolean;
  isUpdatingFeeStructure: boolean;
  feeStructureCompatibility: FeeStructureCompatibility;
  content: string;
  onFeeStructureChange: (feeStructureId: string) => void;
  onInsertPlaceholder: (placeholder: string) => void;
  onEditVariable: (variable: CustomVariable) => void;
};

export type CustomVariablesTabContentProps = {
  customVariables: CustomVariable[];
  onInsertPlaceholder: (placeholder: string) => void;
  onEditVariable: (variable: CustomVariable) => void;
  onAddCustomVariable: () => void;
};

export type PlaceholdersTabContentProps = {
  placeholders: string[];
  validation: PlaceholderValidation;
  validVariablesSet: Set<string>;
};

export type VariablesPanelTabsProps = {
  activeTab: VariablesPanelTab;
  placeholdersCount: number;
  customVariablesCount: number;
  onTabChange: (tab: VariablesPanelTab) => void;
};
