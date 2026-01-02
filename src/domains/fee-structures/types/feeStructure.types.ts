import { FeeStructureStatus, FeeVariableType } from "@prisma/client";

export type FeeStructureListItem = {
  id: string;
  name: string;
  status: FeeStructureStatus;
  updatedAt: string;
  variableCount: number;
  contractCount: number;
  templateCount: number;
};

// Sub-field definition for composite variables
export type SubField = {
  key: string; // e.g., "hours", "percentage"
  label: string; // e.g., "Hours", "Percentage"
  type: "NUMBER" | "MONEY" | "TEXT";
  defaultValue?: number | string;
  required?: boolean;
  unit?: string; // e.g., "hours", "%"
};

// Value type for composite variables (nested object)
export type CompositeValue = Record<string, number | string | null>;

export type FeeVariableData = {
  id: string;
  feeStructureId: string;
  label: string;
  key: string;
  type: FeeVariableType;
  defaultValue: unknown;
  required: boolean;
  currency: string | null;
  decimals: number | null;
  unit: string | null;
  included: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // Composite variable fields
  composite: boolean;
  subFields: SubField[] | null;
  referenceKey: string | null;
};

export type FeeStructureData = {
  id: string;
  name: string;
  description: string | null;
  status: FeeStructureStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  variables: FeeVariableData[];
};

export type CreateFeeStructureInput = {
  name: string;
  description?: string;
};

export type UpdateFeeStructureInput = {
  id: string;
  name: string;
  description?: string;
};

export type CreateFeeVariableInput = {
  feeStructureId: string;
  label: string;
  key: string;
  type: FeeVariableType;
  defaultValue?: unknown;
  required?: boolean;
  currency?: string;
  decimals?: number;
  unit?: string;
  included?: boolean;
  sortOrder?: number;
  // Composite variable fields
  composite?: boolean;
  subFields?: SubField[];
  referenceKey?: string;
};

export type UpdateFeeVariableInput = {
  feeStructureId: string;
  variableId: string;
  label: string;
  key: string;
  type: FeeVariableType;
  defaultValue?: unknown;
  required?: boolean;
  currency?: string;
  decimals?: number;
  unit?: string;
  included?: boolean;
  sortOrder?: number;
  // Composite variable fields
  composite?: boolean;
  subFields?: SubField[];
  referenceKey?: string;
};

export type DeleteFeeVariableInput = {
  feeStructureId: string;
  variableId: string;
};

export type ListFeeStructuresInput = {
  status?: "ALL" | FeeStructureStatus;
  search?: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
