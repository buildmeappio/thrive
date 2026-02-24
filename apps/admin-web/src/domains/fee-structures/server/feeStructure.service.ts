import prisma from '@/lib/db';
import { FeeStructureStatus, FeeVariableType, Prisma } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import {
  FeeStructureListItem,
  FeeStructureData,
  FeeVariableData,
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
  CreateFeeVariableInput,
  UpdateFeeVariableInput,
  ListFeeStructuresInput,
} from '../types/feeStructure.types';

// Helper to format variable data
const formatVariable = (variable: {
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
  composite: boolean;
  subFields: unknown;
  referenceKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}): FeeVariableData => ({
  id: variable.id,
  feeStructureId: variable.feeStructureId,
  label: variable.label,
  key: variable.key,
  type: variable.type,
  defaultValue: variable.defaultValue,
  required: variable.required,
  currency: variable.currency,
  decimals: variable.decimals,
  unit: variable.unit,
  included: variable.included,
  sortOrder: variable.sortOrder,
  composite: variable.composite,
  subFields: Array.isArray(variable.subFields)
    ? (variable.subFields as FeeVariableData['subFields'])
    : null,
  referenceKey: variable.referenceKey,
  createdAt: variable.createdAt.toISOString(),
  updatedAt: variable.updatedAt.toISOString(),
});

// List fee structures with optional filters
export const listFeeStructures = async (
  input: ListFeeStructuresInput
): Promise<FeeStructureListItem[]> => {
  const { status, search } = input;

  const where: {
    status?: FeeStructureStatus;
    name?: { contains: string; mode: 'insensitive' };
  } = {};

  if (status && status !== 'ALL') {
    where.status = status as FeeStructureStatus;
  }

  if (search && search.trim()) {
    where.name = {
      contains: search.trim(),
      mode: 'insensitive',
    };
  }

  const feeStructures = await prisma.feeStructure.findMany({
    where,
    include: {
      _count: {
        select: {
          variables: true,
          contracts: true,
          templates: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return feeStructures.map(fs => ({
    id: fs.id,
    name: fs.name,
    status: fs.status,
    updatedAt: fs.updatedAt.toISOString(),
    variableCount: fs._count.variables,
    contractCount: fs._count.contracts,
    templateCount: fs._count.templates,
  }));
};

// Get a single fee structure with all variables
export const getFeeStructure = async (id: string): Promise<FeeStructureData> => {
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id },
    include: {
      variables: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!feeStructure) {
    throw HttpError.notFound('Fee structure not found');
  }

  return {
    id: feeStructure.id,
    name: feeStructure.name,
    description: feeStructure.description,
    status: feeStructure.status,
    createdBy: feeStructure.createdBy,
    createdAt: feeStructure.createdAt.toISOString(),
    updatedAt: feeStructure.updatedAt.toISOString(),
    variables: feeStructure.variables.map(formatVariable),
  };
};

// Create a new fee structure (always starts as DRAFT)
export const createFeeStructure = async (
  input: CreateFeeStructureInput,
  createdBy?: string
): Promise<{ id: string }> => {
  const feeStructure = await prisma.feeStructure.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      status: FeeStructureStatus.DRAFT,
      createdBy: createdBy || null,
    },
  });

  return { id: feeStructure.id };
};

// Update fee structure metadata
export const updateFeeStructure = async (
  input: UpdateFeeStructureInput
): Promise<{ id: string }> => {
  const existing = await prisma.feeStructure.findUnique({
    where: { id: input.id },
  });

  if (!existing) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Don't allow editing archived structures
  if (existing.status === FeeStructureStatus.ARCHIVED) {
    throw HttpError.badRequest('Cannot edit an archived fee structure');
  }

  await prisma.feeStructure.update({
    where: { id: input.id },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
    },
  });

  return { id: input.id };
};

// Duplicate a fee structure
export const duplicateFeeStructure = async (
  id: string,
  createdBy?: string
): Promise<{ id: string }> => {
  const existing = await prisma.feeStructure.findUnique({
    where: { id },
    include: {
      variables: true,
    },
  });

  if (!existing) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Create the duplicate with "(Copy)" suffix
  const newFeeStructure = await prisma.feeStructure.create({
    data: {
      name: `${existing.name} (Copy)`,
      description: existing.description,
      status: FeeStructureStatus.DRAFT,
      createdBy: createdBy || null,
    },
  });

  // Duplicate all variables
  if (existing.variables.length > 0) {
    await prisma.feeStructureVariable.createMany({
      data: existing.variables.map(v => ({
        feeStructureId: newFeeStructure.id,
        label: v.label,
        key: v.key,
        type: v.type,
        defaultValue: v.defaultValue,
        required: v.required,
        currency: v.currency,
        decimals: v.decimals,
        unit: v.unit,
        sortOrder: v.sortOrder,
        composite: v.composite,
        subFields: v.subFields as Prisma.InputJsonValue,
        referenceKey: v.referenceKey,
      })),
    });
  }

  return { id: newFeeStructure.id };
};

// Archive a fee structure
export const archiveFeeStructure = async (
  id: string
): Promise<{ id: string; status: FeeStructureStatus }> => {
  const existing = await prisma.feeStructure.findUnique({
    where: { id },
  });

  if (!existing) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Idempotent - if already archived, just return
  if (existing.status === FeeStructureStatus.ARCHIVED) {
    return { id, status: FeeStructureStatus.ARCHIVED };
  }

  const updated = await prisma.feeStructure.update({
    where: { id },
    data: { status: FeeStructureStatus.ARCHIVED },
  });

  return { id: updated.id, status: updated.status };
};

// Validate and activate a fee structure
export const activateFeeStructure = async (
  id: string
): Promise<{ id: string; status: FeeStructureStatus }> => {
  const existing = await prisma.feeStructure.findUnique({
    where: { id },
    include: {
      variables: true,
    },
  });

  if (!existing) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Already active - return current status
  if (existing.status === FeeStructureStatus.ACTIVE) {
    return { id, status: FeeStructureStatus.ACTIVE };
  }

  // Cannot activate archived structures
  if (existing.status === FeeStructureStatus.ARCHIVED) {
    throw HttpError.badRequest('Cannot activate an archived fee structure');
  }

  // Validation errors
  const fieldErrors: Record<string, string> = {};

  // Validate name is present
  if (!existing.name || existing.name.trim() === '') {
    fieldErrors['name'] = 'Name is required';
  }

  // Validate each variable
  const keyRegex = /^[a-z][a-z0-9_]*$/;
  const seenKeys = new Set<string>();

  for (const variable of existing.variables) {
    // Check key format
    if (!keyRegex.test(variable.key)) {
      fieldErrors[`variables.${variable.key}.key`] =
        'Key must be snake_case (lowercase letters, numbers, and underscores, starting with a letter)';
    }

    // Check key uniqueness
    if (seenKeys.has(variable.key)) {
      fieldErrors[`variables.${variable.key}.key`] = 'Duplicate key found';
    }
    seenKeys.add(variable.key);

    // Check required variables have valid default values
    if (variable.required) {
      if (variable.defaultValue === null || variable.defaultValue === undefined) {
        fieldErrors[`variables.${variable.key}.defaultValue`] =
          'Required variable must have a default value';
      } else {
        // Type-specific validation for required fields
        switch (variable.type) {
          case FeeVariableType.MONEY:
          case FeeVariableType.NUMBER: {
            const numValue = Number(variable.defaultValue);
            if (isNaN(numValue)) {
              fieldErrors[`variables.${variable.key}.defaultValue`] =
                'Default value must be a valid number';
            }
            break;
          }
          case FeeVariableType.BOOLEAN: {
            if (typeof variable.defaultValue !== 'boolean') {
              fieldErrors[`variables.${variable.key}.defaultValue`] =
                'Default value must be a boolean';
            }
            break;
          }
          case FeeVariableType.TEXT: {
            if (typeof variable.defaultValue !== 'string' || variable.defaultValue.trim() === '') {
              fieldErrors[`variables.${variable.key}.defaultValue`] =
                'Default value cannot be empty for required text variables';
            }
            break;
          }
        }
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    const error = new Error('Validation failed') as Error & {
      fieldErrors: Record<string, string>;
    };
    error.fieldErrors = fieldErrors;
    throw error;
  }

  const updated = await prisma.feeStructure.update({
    where: { id },
    data: { status: FeeStructureStatus.ACTIVE },
  });

  return { id: updated.id, status: updated.status };
};

// Create a new variable
export const createFeeVariable = async (input: CreateFeeVariableInput): Promise<{ id: string }> => {
  // Check if fee structure exists
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: input.feeStructureId },
  });

  if (!feeStructure) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Don't allow adding variables to archived structures
  if (feeStructure.status === FeeStructureStatus.ARCHIVED) {
    throw HttpError.badRequest('Cannot add variables to an archived fee structure');
  }

  // Check for duplicate key
  const existingKey = await prisma.feeStructureVariable.findFirst({
    where: {
      feeStructureId: input.feeStructureId,
      key: input.key,
    },
  });

  if (existingKey) {
    const error = new Error('Key already exists in this fee structure') as Error & {
      fieldErrors: Record<string, string>;
    };
    error.fieldErrors = {
      key: 'This key already exists in this fee structure',
    };
    throw error;
  }

  // Get max sort order
  const maxSortOrder = await prisma.feeStructureVariable.aggregate({
    where: { feeStructureId: input.feeStructureId },
    _max: { sortOrder: true },
  });

  // Validate referenceKey exists if provided
  if (input.referenceKey) {
    const referencedVariable = await prisma.feeStructureVariable.findFirst({
      where: {
        feeStructureId: input.feeStructureId,
        key: input.referenceKey,
      },
    });

    if (!referencedVariable) {
      const error = new Error('Reference key does not exist in this fee structure') as Error & {
        fieldErrors: Record<string, string>;
      };
      error.fieldErrors = {
        referenceKey: 'Reference key does not exist in this fee structure',
      };
      throw error;
    }

    // Prevent circular references (variable cannot reference itself)
    // Note: We can't check this here since variable doesn't exist yet, but we check in update
  }

  const variable = await prisma.feeStructureVariable.create({
    data: {
      feeStructureId: input.feeStructureId,
      label: input.label.trim(),
      key: input.key.trim(),
      type: input.type,
      defaultValue: (input.defaultValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      required: input.required ?? false,
      currency: input.type === FeeVariableType.MONEY ? input.currency || 'CAD' : null,
      decimals:
        input.type === FeeVariableType.MONEY
          ? (input.decimals ?? 2)
          : input.type === FeeVariableType.NUMBER
            ? (input.decimals ?? 0)
            : null,
      unit: input.unit?.trim() || null,
      included: input.included ?? false,
      sortOrder: input.sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1,
      composite: input.composite ?? false,
      subFields: input.subFields ? (input.subFields as Prisma.InputJsonValue) : null,
      referenceKey: input.referenceKey?.trim() || null,
    },
  });

  return { id: variable.id };
};

// Update an existing variable
export const updateFeeVariable = async (input: UpdateFeeVariableInput): Promise<{ id: string }> => {
  // Check if fee structure exists
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: input.feeStructureId },
  });

  if (!feeStructure) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Don't allow editing variables in archived structures
  if (feeStructure.status === FeeStructureStatus.ARCHIVED) {
    throw HttpError.badRequest('Cannot edit variables in an archived fee structure');
  }

  // Check if variable exists
  const existingVariable = await prisma.feeStructureVariable.findUnique({
    where: { id: input.variableId },
  });

  if (!existingVariable || existingVariable.feeStructureId !== input.feeStructureId) {
    throw HttpError.notFound('Variable not found');
  }

  // Check for duplicate key (excluding self)
  const duplicateKey = await prisma.feeStructureVariable.findFirst({
    where: {
      feeStructureId: input.feeStructureId,
      key: input.key,
      id: { not: input.variableId },
    },
  });

  if (duplicateKey) {
    const error = new Error('Key already exists in this fee structure') as Error & {
      fieldErrors: Record<string, string>;
    };
    error.fieldErrors = {
      key: 'This key already exists in this fee structure',
    };
    throw error;
  }

  // Validate referenceKey exists if provided
  if (input.referenceKey) {
    const referencedVariable = await prisma.feeStructureVariable.findFirst({
      where: {
        feeStructureId: input.feeStructureId,
        key: input.referenceKey,
        id: { not: input.variableId }, // Exclude self
      },
    });

    if (!referencedVariable) {
      const error = new Error('Reference key does not exist in this fee structure') as Error & {
        fieldErrors: Record<string, string>;
      };
      error.fieldErrors = {
        referenceKey: 'Reference key does not exist in this fee structure',
      };
      throw error;
    }

    // Prevent circular references (variable cannot reference itself)
    if (input.referenceKey === existingVariable.key) {
      const error = new Error('Variable cannot reference itself') as Error & {
        fieldErrors: Record<string, string>;
      };
      error.fieldErrors = {
        referenceKey: 'Variable cannot reference itself',
      };
      throw error;
    }
  }

  await prisma.feeStructureVariable.update({
    where: { id: input.variableId },
    data: {
      label: input.label.trim(),
      key: input.key.trim(),
      type: input.type,
      defaultValue: (input.defaultValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      required: input.required ?? false,
      currency: input.type === FeeVariableType.MONEY ? input.currency || 'CAD' : null,
      decimals:
        input.type === FeeVariableType.MONEY
          ? (input.decimals ?? 2)
          : input.type === FeeVariableType.NUMBER
            ? (input.decimals ?? 0)
            : null,
      unit: input.unit?.trim() || null,
      included: input.included ?? false,
      sortOrder: input.sortOrder ?? existingVariable.sortOrder,
      composite: input.composite ?? false,
      subFields: input.subFields ? (input.subFields as Prisma.InputJsonValue) : null,
      referenceKey: input.referenceKey?.trim() || null,
    },
  });

  return { id: input.variableId };
};

// Delete a variable
export const deleteFeeVariable = async (
  feeStructureId: string,
  variableId: string
): Promise<{ success: boolean }> => {
  // Check if fee structure exists
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
  });

  if (!feeStructure) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Don't allow deleting variables from archived structures
  if (feeStructure.status === FeeStructureStatus.ARCHIVED) {
    throw HttpError.badRequest('Cannot delete variables from an archived fee structure');
  }

  // Check if variable exists
  const variable = await prisma.feeStructureVariable.findUnique({
    where: { id: variableId },
  });

  if (!variable || variable.feeStructureId !== feeStructureId) {
    throw HttpError.notFound('Variable not found');
  }

  await prisma.feeStructureVariable.delete({
    where: { id: variableId },
  });

  return { success: true };
};

// Delete a fee structure
export const deleteFeeStructure = async (id: string): Promise<{ id: string }> => {
  const existing = await prisma.feeStructure.findUnique({
    where: { id },
  });

  if (!existing) {
    throw HttpError.notFound('Fee structure not found');
  }

  // Check if fee structure is used by any contracts
  const contractCount = await prisma.contract.count({
    where: { feeStructureId: id },
  });

  if (contractCount > 0) {
    throw HttpError.badRequest(
      `Cannot delete fee structure that is used by ${contractCount} contract${contractCount === 1 ? '' : 's'}. Please delete or reassign the contracts first.`
    );
  }

  // Check if fee structure is used by any templates
  const templateCount = await prisma.documentTemplate.count({
    where: { feeStructureId: id },
  });

  if (templateCount > 0) {
    throw HttpError.badRequest(
      `Cannot delete fee structure that is used by ${templateCount} contract template${templateCount === 1 ? '' : 's'}. Please reassign or delete the templates first.`
    );
  }

  // Delete all variables first (cascade)
  await prisma.feeStructureVariable.deleteMany({
    where: { feeStructureId: id },
  });

  // Delete the fee structure
  await prisma.feeStructure.delete({
    where: { id },
  });

  return { id };
};
