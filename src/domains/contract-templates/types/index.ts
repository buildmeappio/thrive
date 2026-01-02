// Re-export all types for convenience
export type { ContractTemplateData } from "./contractTemplate.types";
export type {
  EditorRef,
  ContractTemplateEditContentProps,
} from "./contractTemplateEdit.types";
export type {
  VariableGroup,
  VariableUpdateData,
  VariablesPanelTab,
} from "./variables.types";
export type {
  PlaceholderValidation,
  FeeStructureCompatibility,
} from "./validation.types";
export type {
  UseVariablesReturn,
  UseFeeStructuresReturn,
  UseGoogleDocsSyncReturn,
  UsePlaceholdersReturn,
  UseTemplateSaveReturn,
} from "./hooks.types";
export type {
  VariablesPanelProps,
  VariablesTabContentProps,
  CustomVariablesTabContentProps,
  PlaceholdersTabContentProps,
  VariablesPanelTabsProps,
} from "./variablesPanel.types";

// Re-export external types for convenience
export type { CustomVariable } from "@/domains/custom-variables/types/customVariable.types";
export type {
  FeeStructureListItem,
  FeeStructureData,
} from "@/domains/fee-structures/types/feeStructure.types";
export type { HeaderConfig, FooterConfig } from "@/components/editor/types";
