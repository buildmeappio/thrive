import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import {
  CustomVariable,
  CreateCustomVariableInput,
  UpdateCustomVariableInput,
  ListCustomVariablesInput,
} from '../types/customVariable.types';

/**
 * Normalizes a variable key to the proper format
 * - Adds "custom." prefix if not present
 * - Converts to lowercase
 * - Replaces spaces and special characters with underscores
 * - Removes leading/trailing underscores
 * - Replaces multiple underscores with single underscore
 */
function normalizeVariableKey(key: string): string {
  let normalized = key.trim();

  if (!normalized) {
    throw new Error('Variable key cannot be empty');
  }

  // If it already has a namespace (contains a dot), extract it
  if (normalized.includes('.')) {
    const parts = normalized.split('.');
    const keyPart = parts.slice(1).join('.'); // Keep periods in key part

    // Normalize the key part
    let normalizedKeyPart = keyPart
      .toLowerCase()
      .replace(/[^a-z0-9_.]+/g, '_') // Replace non-alphanumeric (except underscore and period) with underscore
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .replace(/_+/g, '_'); // Replace multiple underscores with single underscore

    // Remove periods at the end
    normalizedKeyPart = normalizedKeyPart.replace(/\.+$/, '');

    // Ensure key part is not empty
    if (!normalizedKeyPart) {
      throw new Error('Variable key part cannot be empty after normalization');
    }

    // Always use "custom." namespace for custom variables
    return `custom.${normalizedKeyPart}`;
  }

  // No namespace, normalize and add "custom." prefix
  normalized = normalized
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_') // Replace non-alphanumeric (except underscore) with underscore
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .replace(/_+/g, '_'); // Replace multiple underscores with single underscore

  if (!normalized) {
    throw new Error('Variable key cannot be empty after normalization');
  }

  return `custom.${normalized}`;
}

// List all custom variables
export const listCustomVariables = async (
  input: ListCustomVariablesInput = {}
): Promise<CustomVariable[]> => {
  const where: { isActive?: boolean } = {};

  if (input.isActive !== undefined) {
    where.isActive = input.isActive;
  }

  const variables = await prisma.customVariable.findMany({
    where,
    orderBy: [{ key: 'asc' }],
  });

  return variables.map(v => {
    // Ensure variableType is always set - handle null/undefined cases
    const dbVariableType = v.variableType;
    let variableType: 'text' | 'checkbox_group' = 'text';

    if (dbVariableType === 'checkbox_group') {
      variableType = 'checkbox_group';
    } else if (dbVariableType === 'text') {
      variableType = 'text';
    }
    // If variableType is null/undefined/empty, default to "text"
    // This handles old records that were created before variableType was added

    const result = {
      id: v.id,
      key: v.key,
      defaultValue: v.defaultValue,
      description: v.description,
      label: v.label || null,
      isActive: v.isActive,
      variableType: variableType, // Always "text" or "checkbox_group", never undefined
      options: (v.options as any) || null,
      showUnderline: v.showUnderline ?? false,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    } satisfies CustomVariable;

    return result;
  });
};

// Get a single custom variable
export const getCustomVariable = async (id: string): Promise<CustomVariable> => {
  const variable = await prisma.customVariable.findUnique({
    where: { id },
  });

  if (!variable) {
    throw HttpError.notFound('Custom variable not found');
  }

  // Ensure variableType is always set - handle null/undefined cases
  let variableType: 'text' | 'checkbox_group' = 'text';
  if (variable.variableType === 'checkbox_group') {
    variableType = 'checkbox_group';
  } else if (variable.variableType === 'text') {
    variableType = 'text';
  }

  return {
    id: variable.id,
    key: variable.key,
    defaultValue: variable.defaultValue,
    description: variable.description,
    label: variable.label || null,
    isActive: variable.isActive,
    variableType: variableType,
    options: (variable.options as any) || null,
    showUnderline: variable.showUnderline ?? false,
    createdAt: variable.createdAt.toISOString(),
    updatedAt: variable.updatedAt.toISOString(),
  } satisfies CustomVariable;
};

// Create a new custom variable
export const createCustomVariable = async (
  input: CreateCustomVariableInput
): Promise<CustomVariable> => {
  // Normalize the key automatically
  const normalizedKey = normalizeVariableKey(input.key);

  // Check if key already exists
  const existing = await prisma.customVariable.findFirst({
    where: { key: normalizedKey },
  });

  if (existing) {
    throw HttpError.badRequest(`A custom variable with key "${normalizedKey}" already exists`);
  }

  const variable = await prisma.customVariable.create({
    data: {
      key: normalizedKey,
      defaultValue: input.defaultValue || '', // Empty string for checkbox groups
      description: input.description || null,
      label: input.label || null,
      isActive: true,
      variableType: input.variableType || 'text', // Explicitly set variableType
      options: input.options || null,
      showUnderline: input.showUnderline ?? false,
    } as any,
  });

  // Ensure variableType is always set - handle null/undefined cases
  const dbVariableType = variable.variableType;
  let variableType: 'text' | 'checkbox_group' = 'text';

  if (dbVariableType === 'checkbox_group') {
    variableType = 'checkbox_group';
  } else if (dbVariableType === 'text') {
    variableType = 'text';
  }

  return {
    id: variable.id,
    key: variable.key,
    defaultValue: variable.defaultValue,
    description: variable.description,
    label: variable.label || null,
    isActive: variable.isActive,
    variableType: variableType,
    options: (variable.options as any) || null,
    showUnderline: variable.showUnderline ?? false,
    createdAt: variable.createdAt.toISOString(),
    updatedAt: variable.updatedAt.toISOString(),
  } satisfies CustomVariable;
};

// Update a custom variable
export const updateCustomVariable = async (
  input: UpdateCustomVariableInput
): Promise<CustomVariable> => {
  const { id, ...updateData } = input;

  // Get the existing variable to check if it's a system variable
  const existingVariable = await prisma.customVariable.findUnique({
    where: { id },
  });

  if (!existingVariable) {
    throw HttpError.notFound('Variable not found');
  }

  // Prevent key changes for system variables (non-custom.*)
  if (
    updateData.key &&
    !existingVariable.key.startsWith('custom.') &&
    updateData.key !== existingVariable.key
  ) {
    throw HttpError.badRequest(
      'System variable keys cannot be changed. Only custom variables can have their keys modified.'
    );
  }

  // If updating key, normalize it and check for duplicates
  if (updateData.key && updateData.key !== existingVariable.key) {
    const normalizedKey = normalizeVariableKey(updateData.key);
    updateData.key = normalizedKey;

    const existing = await prisma.customVariable.findFirst({
      where: {
        key: normalizedKey,
        NOT: { id },
      },
    });

    if (existing) {
      throw HttpError.badRequest(`A custom variable with key "${normalizedKey}" already exists`);
    }
  }

  // Prepare update data, handling options JSON and defaultValue
  const updatePayload: any = { ...updateData };
  if (updateData.options !== undefined) {
    updatePayload.options = updateData.options;
  }
  // Ensure defaultValue is never null - convert to empty string if null
  if (updateData.defaultValue !== undefined) {
    updatePayload.defaultValue = updateData.defaultValue ?? '';
  }

  const variable = await prisma.customVariable.update({
    where: { id },
    data: updatePayload,
  });

  // Ensure variableType is always set - handle null/undefined cases
  const dbVariableType = variable.variableType;
  let variableType: 'text' | 'checkbox_group' = 'text';

  if (dbVariableType === 'checkbox_group') {
    variableType = 'checkbox_group';
  } else if (dbVariableType === 'text') {
    variableType = 'text';
  }

  return {
    id: variable.id,
    key: variable.key,
    defaultValue: variable.defaultValue,
    description: variable.description,
    label: variable.label || null,
    isActive: variable.isActive,
    variableType: variableType,
    options: (variable.options as any) || null,
    showUnderline: variable.showUnderline ?? false,
    createdAt: variable.createdAt.toISOString(),
    updatedAt: variable.updatedAt.toISOString(),
  } satisfies CustomVariable;
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
  namespace: string
): Promise<Array<{ key: string; defaultValue: string; description: string | null }>> => {
  const variables = await listCustomVariables({ isActive: true });
  return variables
    .filter(v => v.key.startsWith(`${namespace}.`))
    .map(v => ({
      key: v.key.replace(`${namespace}.`, ''), // Return just the key part after namespace
      defaultValue: v.defaultValue,
      description: v.description,
    }));
};

// Legacy function name for backward compatibility
export const getActiveCustomVariablesMap = getAllVariablesMap;
