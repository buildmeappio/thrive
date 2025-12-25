import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import {
  CustomVariable,
  CreateCustomVariableInput,
  UpdateCustomVariableInput,
  ListCustomVariablesInput,
} from "../types/customVariable.types";

// List all custom variables
export const listCustomVariables = async (
  input: ListCustomVariablesInput = {},
): Promise<CustomVariable[]> => {
  const where: { isActive?: boolean } = {};

  if (input.isActive !== undefined) {
    where.isActive = input.isActive;
  }

  const variables = await prisma.customVariable.findMany({
    where,
    orderBy: [{ key: "asc" }],
  });

  return variables.map((v) => ({
    id: v.id,
    key: v.key,
    defaultValue: v.defaultValue,
    description: v.description,
    isActive: v.isActive,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));
};

// Get a single custom variable
export const getCustomVariable = async (
  id: string,
): Promise<CustomVariable> => {
  const variable = await prisma.customVariable.findUnique({
    where: { id },
  });

  if (!variable) {
    throw HttpError.notFound("Custom variable not found");
  }

  return {
    id: variable.id,
    key: variable.key,
    defaultValue: variable.defaultValue,
    description: variable.description,
    isActive: variable.isActive,
    createdAt: variable.createdAt.toISOString(),
    updatedAt: variable.updatedAt.toISOString(),
  };
};

// Create a new custom variable
export const createCustomVariable = async (
  input: CreateCustomVariableInput,
): Promise<CustomVariable> => {
  // Check if key already exists
  const existing = await prisma.customVariable.findFirst({
    where: { key: input.key },
  });

  if (existing) {
    throw HttpError.badRequest(
      `A custom variable with key "${input.key}" already exists`,
    );
  }

  const variable = await prisma.customVariable.create({
    data: {
      key: input.key,
      defaultValue: input.defaultValue,
      description: input.description || null,
      isActive: true,
    },
  });

  return {
    id: variable.id,
    key: variable.key,
    defaultValue: variable.defaultValue,
    description: variable.description,
    isActive: variable.isActive,
    createdAt: variable.createdAt.toISOString(),
    updatedAt: variable.updatedAt.toISOString(),
  };
};

// Update a custom variable
export const updateCustomVariable = async (
  input: UpdateCustomVariableInput,
): Promise<CustomVariable> => {
  const { id, ...updateData } = input;

  // Get the existing variable to check if it's a system variable
  const existingVariable = await prisma.customVariable.findUnique({
    where: { id },
  });

  if (!existingVariable) {
    throw HttpError.notFound("Variable not found");
  }

  // Prevent key changes for system variables (non-custom.*)
  if (
    updateData.key &&
    !existingVariable.key.startsWith("custom.") &&
    updateData.key !== existingVariable.key
  ) {
    throw HttpError.badRequest(
      "System variable keys cannot be changed. Only custom variables can have their keys modified.",
    );
  }

  // If updating key, check for duplicates
  if (updateData.key && updateData.key !== existingVariable.key) {
    const existing = await prisma.customVariable.findFirst({
      where: {
        key: updateData.key,
        NOT: { id },
      },
    });

    if (existing) {
      throw HttpError.badRequest(
        `A custom variable with key "${updateData.key}" already exists`,
      );
    }
  }

  const variable = await prisma.customVariable.update({
    where: { id },
    data: updateData,
  });

  return {
    id: variable.id,
    key: variable.key,
    defaultValue: variable.defaultValue,
    description: variable.description,
    isActive: variable.isActive,
    createdAt: variable.createdAt.toISOString(),
    updatedAt: variable.updatedAt.toISOString(),
  };
};

// Delete a custom variable (soft delete by setting isActive to false)
export const deleteCustomVariable = async (id: string): Promise<void> => {
  await prisma.customVariable.update({
    where: { id },
    data: { isActive: false },
  });
};

// Get all active variables as a map for placeholder replacement
// Variables are stored with their full key (e.g., "thrive.company_name", "custom.copyright")
export const getAllVariablesMap = async (): Promise<Record<string, string>> => {
  const variables = await listCustomVariables({ isActive: true });
  const map: Record<string, string> = {};

  for (const variable of variables) {
    // Key is stored as full placeholder key (e.g., "thrive.company_name" or "custom.copyright")
    map[variable.key] = variable.defaultValue;
  }

  return map;
};

// Get variables by namespace (e.g., "thrive", "custom", "contract")
export const getVariablesByNamespace = async (
  namespace: string,
): Promise<
  Array<{ key: string; defaultValue: string; description: string | null }>
> => {
  const variables = await listCustomVariables({ isActive: true });
  return variables
    .filter((v) => v.key.startsWith(`${namespace}.`))
    .map((v) => ({
      key: v.key.replace(`${namespace}.`, ""), // Return just the key part after namespace
      defaultValue: v.defaultValue,
      description: v.description,
    }));
};

// Legacy function name for backward compatibility
export const getActiveCustomVariablesMap = getAllVariablesMap;
