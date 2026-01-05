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
 * Active tab type for variables panel
 */
export type VariablesPanelTab = "variables" | "custom" | "placeholders";
