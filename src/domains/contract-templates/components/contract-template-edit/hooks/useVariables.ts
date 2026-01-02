"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  listCustomVariablesAction,
  createCustomVariableAction,
  updateCustomVariableAction,
} from "@/domains/custom-variables/actions";
import type {
  CustomVariable,
  VariableUpdateData,
  UseVariablesReturn,
} from "../types";

export function useVariables(): UseVariablesReturn {
  const [systemVariables, setSystemVariables] = useState<CustomVariable[]>([]);
  const [customVariables, setCustomVariables] = useState<CustomVariable[]>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [editingVariable, setEditingVariable] = useState<CustomVariable | null>(
    null,
  );
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);
  const [isUpdatingVariable, setIsUpdatingVariable] = useState(false);
  const [isCreatingVariable, setIsCreatingVariable] = useState(false);

  // Load variables on mount
  useEffect(() => {
    const loadVariables = async () => {
      setIsLoadingVariables(true);
      try {
        const result = await listCustomVariablesAction({ isActive: true });
        if ("error" in result) {
          console.error("Failed to load variables:", result.error);
          toast.error(result.error ?? "Failed to load variables");
          return;
        }
        if (result.data) {
          // Separate system variables and custom variables
          const system = result.data.filter(
            (v) => !v.key.startsWith("custom."),
          );
          const custom = result.data.filter((v) => v.key.startsWith("custom."));

          setSystemVariables(system);
          setCustomVariables(custom);
        }
      } catch (error) {
        console.error("Error loading variables:", error);
      } finally {
        setIsLoadingVariables(false);
      }
    };
    loadVariables();
  }, []);

  // Optimistic update + rollback for variable updates
  const handleVariableUpdate = useCallback(
    async (data: VariableUpdateData) => {
      if (!editingVariable) {
        // Creating new variable (no optimistic update needed; it adds a new item)
        setIsCreatingVariable(true);
        try {
          // Ensure key starts with "custom."
          const variableKey = data.key.startsWith("custom.")
            ? data.key
            : `custom.${data.key}`;

          const result = await createCustomVariableAction({
            key: variableKey,
            defaultValue:
              data.variableType === "checkbox_group"
                ? ""
                : data.defaultValue || "",
            description: data.description,
            label: data.label,
            variableType: data.variableType,
            options: data.options,
            showUnderline: data.showUnderline,
          });

          if ("error" in result) {
            toast.error(result.error ?? "Failed to create variable");
            return;
          }

          // Add to custom variables list
          setCustomVariables((prev) => [...prev, result.data]);

          toast.success("Custom variable created successfully");
          setIsVariableDialogOpen(false);
          setEditingVariable(null);
        } catch (error) {
          console.error("Error creating variable:", error);
          toast.error("Failed to create variable");
        } finally {
          setIsCreatingVariable(false);
        }
        return;
      }

      // Updating existing variable with optimistic update and rollback
      setIsUpdatingVariable(true);

      // Check if variable still exists before attempting update
      const isCustomVar = editingVariable.key.startsWith("custom.");
      const variableStillExists = isCustomVar
        ? customVariables.some((v) => v.id === editingVariable.id)
        : systemVariables.some((v) => v.id === editingVariable.id);

      if (!variableStillExists) {
        toast.error("Variable was deleted. Please refresh the page.");
        setIsVariableDialogOpen(false);
        setEditingVariable(null);
        setIsUpdatingVariable(false);
        return;
      }

      // Save previous state for rollback
      let prevCustom: CustomVariable | null = null;
      let prevSystem: CustomVariable | null = null;

      if (isCustomVar) {
        setCustomVariables((prev) => {
          prevCustom = prev.find((v) => v.id === editingVariable.id) || null;
          // Optimistically update variable in list
          return prev.map((v) =>
            v.id === editingVariable.id
              ? {
                  ...v,
                  key: data.key,
                  defaultValue: data.defaultValue ?? "",
                  description: data.description ?? null,
                  label: data.label ?? v.label,
                  variableType: data.variableType ?? "text",
                  options: data.options ?? null,
                  showUnderline: data.showUnderline ?? v.showUnderline ?? false,
                }
              : v,
          );
        });
      } else {
        setSystemVariables((prev) => {
          prevSystem = prev.find((v) => v.id === editingVariable.id) || null;
          // Optimistically update variable in list
          return prev.map((v) =>
            v.id === editingVariable.id
              ? {
                  ...v,
                  key: data.key,
                  defaultValue: data.defaultValue ?? "",
                  description: data.description ?? null,
                  label: data.label ?? v.label,
                  variableType: data.variableType ?? "text",
                  options: data.options ?? null,
                  showUnderline: data.showUnderline ?? v.showUnderline ?? false,
                }
              : v,
          );
        });
      }

      try {
        const result = await updateCustomVariableAction({
          id: editingVariable.id,
          key: data.key,
          defaultValue: data.defaultValue ?? "",
          description: data.description,
          label: data.label,
          variableType: data.variableType,
          options: data.options,
          showUnderline: data.showUnderline,
        });

        if ("error" in result) {
          // Check if error is "not found" (variable was deleted)
          const isNotFoundError =
            result.error?.toLowerCase().includes("not found") ||
            result.error?.toLowerCase().includes("variable not found");

          if (isNotFoundError) {
            // Variable was deleted - remove it from the list
            if (isCustomVar) {
              setCustomVariables((prev) =>
                prev.filter((v) => v.id !== editingVariable.id),
              );
            } else {
              setSystemVariables((prev) =>
                prev.filter((v) => v.id !== editingVariable.id),
              );
            }
            toast.error("Variable was deleted by another user.");
            setIsVariableDialogOpen(false);
            setEditingVariable(null);
            return;
          }

          // Other errors - rollback to previous state
          if (isCustomVar && prevCustom) {
            setCustomVariables((prev) => {
              const variableExists = prev.some(
                (v) => v.id === editingVariable.id,
              );
              if (variableExists) {
                return prev.map((v) =>
                  v.id === editingVariable.id ? prevCustom! : v,
                );
              }
              // Variable doesn't exist, add it back
              return [...prev, prevCustom!];
            });
          } else if (!isCustomVar && prevSystem) {
            setSystemVariables((prev) => {
              const variableExists = prev.some(
                (v) => v.id === editingVariable.id,
              );
              if (variableExists) {
                return prev.map((v) =>
                  v.id === editingVariable.id ? prevSystem! : v,
                );
              }
              // Variable doesn't exist, add it back
              return [...prev, prevSystem!];
            });
          }
          toast.error(result.error ?? "Failed to update variable");
          return;
        }

        // Success: replace with server return
        if (isCustomVar) {
          setCustomVariables((prev) => {
            const variableExists = prev.some(
              (v) => v.id === editingVariable.id,
            );
            if (variableExists) {
              return prev.map((v) =>
                v.id === editingVariable.id ? result.data : v,
              );
            }
            // Variable was removed, add it back
            return [...prev, result.data];
          });
        } else {
          setSystemVariables((prev) => {
            const variableExists = prev.some(
              (v) => v.id === editingVariable.id,
            );
            if (variableExists) {
              return prev.map((v) =>
                v.id === editingVariable.id ? result.data : v,
              );
            }
            // Variable was removed, add it back
            return [...prev, result.data];
          });
        }

        toast.success("Variable updated successfully");
        setIsVariableDialogOpen(false);
        setEditingVariable(null);
      } catch (error) {
        // Rollback on error - check if variable still exists
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const isNotFoundError =
          errorMessage.toLowerCase().includes("not found") ||
          errorMessage.toLowerCase().includes("variable not found");

        if (isNotFoundError) {
          // Variable was deleted - remove it from the list
          if (isCustomVar) {
            setCustomVariables((prev) =>
              prev.filter((v) => v.id !== editingVariable.id),
            );
          } else {
            setSystemVariables((prev) =>
              prev.filter((v) => v.id !== editingVariable.id),
            );
          }
          toast.error("Variable was deleted by another user.");
          setIsVariableDialogOpen(false);
          setEditingVariable(null);
        } else {
          // Other errors - rollback to previous state
          if (isCustomVar && prevCustom) {
            setCustomVariables((prev) => {
              const variableExists = prev.some(
                (v) => v.id === editingVariable.id,
              );
              if (variableExists) {
                return prev.map((v) =>
                  v.id === editingVariable.id ? prevCustom! : v,
                );
              }
              // Variable doesn't exist, add it back
              return [...prev, prevCustom!];
            });
          } else if (!isCustomVar && prevSystem) {
            setSystemVariables((prev) => {
              const variableExists = prev.some(
                (v) => v.id === editingVariable.id,
              );
              if (variableExists) {
                return prev.map((v) =>
                  v.id === editingVariable.id ? prevSystem! : v,
                );
              }
              // Variable doesn't exist, add it back
              return [...prev, prevSystem!];
            });
          }
          console.error("Error updating variable:", error);
          toast.error("Failed to update variable");
        }
      } finally {
        setIsUpdatingVariable(false);
      }
    },
    [editingVariable, customVariables, systemVariables],
  );

  return {
    systemVariables,
    customVariables,
    isLoadingVariables,
    editingVariable,
    isVariableDialogOpen,
    isUpdatingVariable,
    isCreatingVariable,
    setEditingVariable,
    setIsVariableDialogOpen,
    handleVariableUpdate,
  };
}
