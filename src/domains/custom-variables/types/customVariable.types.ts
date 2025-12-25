export type CustomVariable = {
  id: string;
  key: string;
  defaultValue: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomVariableInput = {
  key: string;
  defaultValue: string;
  description?: string | null;
};

export type UpdateCustomVariableInput = {
  id: string;
  key?: string;
  defaultValue?: string;
  description?: string | null;
  isActive?: boolean;
};

export type ListCustomVariablesInput = {
  isActive?: boolean;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
