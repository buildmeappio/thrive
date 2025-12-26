import { FeeStructureStatus, FeeVariableType } from "@prisma/client";

export type FeeStructureListItem = {
  id: string;
  name: string;
  status: FeeStructureStatus;
  updatedAt: string;
  variableCount: number;
};

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
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
  sortOrder?: number;
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
  sortOrder?: number;
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
