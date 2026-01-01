export type CheckboxOption = {
  label: string;
  value: string;
};

export type CustomVariable = {
  id: string;
  key: string;
  defaultValue: string;
  description: string | null;
  isActive: boolean;
  variableType: "text" | "checkbox_group";
  options: CheckboxOption[] | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomVariableInput = {
  key: string;
  defaultValue?: string;
  description?: string | null;
  variableType?: "text" | "checkbox_group";
  options?: CheckboxOption[];
};

export type UpdateCustomVariableInput = {
  id: string;
  key?: string;
  defaultValue?: string;
  description?: string | null;
  isActive?: boolean;
  variableType?: "text" | "checkbox_group";
  options?: CheckboxOption[];
};

export type ListCustomVariablesInput = {
  isActive?: boolean;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

// Component-specific types
export type CustomVariableFormData = {
  key: string;
  defaultValue: string;
  description?: string | null;
  variableType: "text" | "checkbox_group";
  options?: CheckboxOption[];
};

export type CustomVariableDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomVariableFormData) => Promise<void>;
  initialData?: CustomVariable | null;
  isLoading?: boolean;
};

export type FormErrors = Record<string, string>;
