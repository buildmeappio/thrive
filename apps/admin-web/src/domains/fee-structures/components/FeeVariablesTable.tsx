'use client';

import { useState } from 'react';
import { FeeVariableType } from '@thrive/database';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import FeeVariableDialog from './FeeVariableDialog';
import { FeeVariableData } from '../types/feeStructure.types';
import {
  createFeeVariableAction,
  updateFeeVariableAction,
  deleteFeeVariableAction,
} from '../actions';

type FeeVariablesTableProps = {
  feeStructureId: string;
  variables: FeeVariableData[];
  isReadOnly?: boolean;
};

const formatDefaultValue = (
  value: unknown,
  type?: FeeVariableType,
  currency?: string | null,
  decimals?: number | null,
  unit?: string | null
): string => {
  if (value === null || value === undefined) {
    return '—';
  }

  // Handle non-numeric types
  if (type === 'TEXT' || type === 'BOOLEAN') {
    if (type === 'BOOLEAN') {
      return value === true ? 'Yes' : 'No';
    }
    return String(value);
  }

  const numValue = Number(value);
  if (isNaN(numValue)) return String(value);

  // Format based on type
  if (type === 'MONEY') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'CAD',
      minimumFractionDigits: decimals ?? 2,
      maximumFractionDigits: decimals ?? 2,
    }).format(numValue);
  } else if (type === 'NUMBER') {
    const formatted = numValue.toFixed(decimals ?? 0);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  // Fallback for unknown types (legacy behavior)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'CAD',
    minimumFractionDigits: decimals ?? 2,
    maximumFractionDigits: decimals ?? 2,
  }).format(numValue);
};

export default function FeeVariablesTable({
  feeStructureId,
  variables,
  isReadOnly = false,
}: FeeVariablesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<FeeVariableData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<FeeVariableData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddClick = () => {
    setEditingVariable(null);
    setDialogOpen(true);
  };

  const handleEditClick = (variable: FeeVariableData) => {
    setEditingVariable(variable);
    setDialogOpen(true);
  };

  const handleDeleteClick = (variable: FeeVariableData) => {
    setVariableToDelete(variable);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingVariable(null);
  };

  const handleSubmit = async (data: {
    label: string;
    key: string;
    type: FeeVariableType;
    defaultValue?: unknown;
    required: boolean;
    currency?: string;
    decimals?: number;
    unit?: string;
    included?: boolean;
    composite?: boolean;
    subFields?: Array<{
      key: string;
      label: string;
      type: 'NUMBER' | 'MONEY' | 'TEXT';
      defaultValue?: number | string;
      required?: boolean;
      unit?: string;
    }>;
    referenceKey?: string;
  }): Promise<{ success: boolean; fieldErrors?: Record<string, string> }> => {
    setIsSubmitting(true);

    try {
      let result;

      if (editingVariable) {
        result = await updateFeeVariableAction({
          feeStructureId,
          variableId: editingVariable.id,
          ...data,
        });
      } else {
        result = await createFeeVariableAction({
          feeStructureId,
          ...data,
        });
      }

      if (result.success) {
        toast.success(
          editingVariable ? 'Variable updated successfully' : 'Variable added successfully'
        );
        handleDialogClose();
        return { success: true };
      } else {
        const errorResult = result as {
          success: false;
          error: string;
          fieldErrors?: Record<string, string>;
        };
        toast.error(errorResult.error || 'Failed to save variable');
        return { success: false, fieldErrors: errorResult.fieldErrors };
      }
    } catch {
      toast.error('An error occurred');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!variableToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteFeeVariableAction({
        feeStructureId,
        variableId: variableToDelete.id,
      });

      if (result.success) {
        toast.success('Variable deleted successfully');
      } else {
        const errorResult = result as { success: false; error: string };
        toast.error(errorResult.error || 'Failed to delete variable');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setVariableToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-degular text-lg font-semibold text-gray-900">Fee Variables</h3>
        {!isReadOnly && (
          <Button
            onClick={handleAddClick}
            size="sm"
            className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Variable
          </Button>
        )}
      </div>

      {variables.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-gray-300 py-8 text-center">
          <p className="font-poppins mb-2 text-[16px] text-[#7B8B91]">No variables defined yet</p>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddClick}
              className="rounded-full border-gray-200 hover:bg-gray-50"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add your first variable
            </Button>
          )}
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none lg:max-h-none">
          <div className="min-w-[600px] md:min-w-0">
            <Table className="w-full border-0 md:table-fixed">
              <TableHeader>
                <TableRow className="border-b-0 bg-[#F3F3F3]">
                  <TableHead className="whitespace-nowrap rounded-l-2xl px-3 py-2 text-sm font-medium text-black sm:px-6 sm:text-base">
                    Label
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-3 py-2 text-sm font-medium text-black sm:px-6 sm:text-base">
                    Key
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-3 py-2 text-sm font-medium text-black sm:px-6 sm:text-base">
                    Default
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-3 py-2 text-center text-sm font-medium text-black sm:px-6 sm:text-base">
                    Required
                  </TableHead>
                  {!isReadOnly && (
                    <TableHead className="whitespace-nowrap rounded-r-2xl px-3 py-2 text-right text-sm font-medium text-black sm:px-6 sm:text-base">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {variables.map(variable => (
                  <TableRow
                    key={variable.id}
                    className="hover:bg-muted/50 border-0 border-b bg-white transition-colors"
                  >
                    <TableCell className="px-3 py-3 align-middle sm:px-6 sm:py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-poppins text-sm font-medium leading-normal text-[#4D4D4D] sm:text-[16px]">
                            {variable.label}
                          </span>
                          {variable.composite && (
                            <span className="font-poppins inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Composite
                            </span>
                          )}
                        </div>
                        {variable.composite &&
                          variable.subFields &&
                          variable.subFields.length > 0 && (
                            <div className="font-poppins mt-1 text-xs text-[#7B8B91]">
                              Sub-fields: {variable.subFields.map(sf => sf.label).join(', ')}
                              {variable.referenceKey && (
                                <span className="ml-2 text-blue-600">
                                  (ref: {variable.referenceKey})
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3 align-middle sm:px-6 sm:py-4">
                      <div className="space-y-1">
                        <code className="font-poppins rounded bg-[#EEF1F3] px-1.5 py-0.5 text-xs sm:text-sm">
                          {variable.key}
                        </code>
                        <p className="font-poppins text-xs text-[#7B8B91]">
                          {variable.composite
                            ? `{{fees.${variable.key}.sub_field}}`
                            : `{{fees.${variable.key}}}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3 align-middle sm:px-6 sm:py-4">
                      {variable.composite ? (
                        <span className="font-poppins text-xs italic text-[#7B8B91]">
                          Multiple sub-fields
                        </span>
                      ) : variable.included ? (
                        <span className="font-poppins inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Included
                        </span>
                      ) : (
                        <span className="font-poppins text-sm leading-normal text-[#4D4D4D] sm:text-[16px]">
                          {formatDefaultValue(
                            variable.defaultValue,
                            variable.type,
                            variable.currency,
                            variable.decimals,
                            variable.unit
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3 text-center align-middle sm:px-6 sm:py-4">
                      {variable.required ? (
                        <span className="font-poppins text-sm font-medium text-green-600 sm:text-[16px]">
                          Yes
                        </span>
                      ) : (
                        <span className="font-poppins text-sm text-gray-400 sm:text-[16px]">
                          No
                        </span>
                      )}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="whitespace-nowrap px-3 py-3 text-right align-middle sm:px-6 sm:py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(variable)}
                            title="Edit"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(variable)}
                            title="Delete"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add/Edit Variable Dialog */}
      <FeeVariableDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        initialData={editingVariable}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the variable{' '}
              <strong>{variableToDelete?.label}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
