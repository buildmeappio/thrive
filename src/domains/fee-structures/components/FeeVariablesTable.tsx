"use client";

import { useState } from "react";
import { FeeVariableType } from "@prisma/client";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FeeVariableDialog from "./FeeVariableDialog";
import { FeeVariableData } from "../types/feeStructure.types";
import {
    createFeeVariableAction,
    updateFeeVariableAction,
    deleteFeeVariableAction,
} from "../actions";

type FeeVariablesTableProps = {
    feeStructureId: string;
    variables: FeeVariableData[];
    isReadOnly?: boolean;
};

const formatDefaultValue = (
    value: unknown,
    type: FeeVariableType,
    currency?: string | null,
    decimals?: number | null
): string => {
    if (value === null || value === undefined) {
        return "—";
    }

    switch (type) {
        case "MONEY": {
            const numValue = Number(value);
            if (isNaN(numValue)) return String(value);
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency || "USD",
                minimumFractionDigits: decimals ?? 2,
                maximumFractionDigits: decimals ?? 2,
            }).format(numValue);
        }
        case "NUMBER": {
            const numValue = Number(value);
            if (isNaN(numValue)) return String(value);
            return numValue.toFixed(decimals ?? 0);
        }
        case "BOOLEAN": {
            return value === true ? "Yes" : "No";
        }
        case "TEXT":
        default: {
            const strValue = String(value);
            return strValue.length > 50 ? strValue.substring(0, 50) + "..." : strValue;
        }
    }
};

const getTypeLabel = (type: FeeVariableType): string => {
    const labels: Record<FeeVariableType, string> = {
        MONEY: "Money",
        NUMBER: "Number",
        TEXT: "Text",
        BOOLEAN: "Boolean",
    };
    return labels[type] || type;
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
                    editingVariable ? "Variable updated successfully" : "Variable added successfully"
                );
                handleDialogClose();
                return { success: true };
            } else {
                const errorResult = result as { success: false; error: string; fieldErrors?: Record<string, string> };
                toast.error(errorResult.error || "Failed to save variable");
                return { success: false, fieldErrors: errorResult.fieldErrors };
            }
        } catch {
            toast.error("An error occurred");
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
                toast.success("Variable deleted successfully");
            } else {
                const errorResult = result as { success: false; error: string };
                toast.error(errorResult.error || "Failed to delete variable");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setVariableToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Fee Variables</h3>
                {!isReadOnly && (
                    <Button onClick={handleAddClick} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Variable
                    </Button>
                )}
            </div>

            {variables.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No variables defined yet</p>
                    {!isReadOnly && (
                        <Button variant="outline" size="sm" onClick={handleAddClick}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add your first variable
                        </Button>
                    )}
                </div>
            ) : (
                <div className="rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold">Label</TableHead>
                                <TableHead className="font-semibold">Key</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">Default</TableHead>
                                <TableHead className="font-semibold text-center">Required</TableHead>
                                <TableHead className="font-semibold">Unit</TableHead>
                                {!isReadOnly && (
                                    <TableHead className="font-semibold text-right">Actions</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variables.map((variable) => (
                                <TableRow key={variable.id}>
                                    <TableCell className="font-medium">{variable.label}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">
                                                {variable.key}
                                            </code>
                                            <p className="text-xs text-muted-foreground">
                                                {"{{fees." + variable.key + "}}"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getTypeLabel(variable.type)}</TableCell>
                                    <TableCell>
                                        {formatDefaultValue(
                                            variable.defaultValue,
                                            variable.type,
                                            variable.currency,
                                            variable.decimals
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {variable.required ? (
                                            <span className="text-green-600 font-medium">Yes</span>
                                        ) : (
                                            <span className="text-gray-400">No</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{variable.unit || "—"}</TableCell>
                                    {!isReadOnly && (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(variable)}
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(variable)}
                                                    title="Delete"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                            Are you sure you want to delete the variable{" "}
                            <strong>{variableToDelete?.label}</strong>? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
