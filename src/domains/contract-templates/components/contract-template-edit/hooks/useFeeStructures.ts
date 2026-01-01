"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  listFeeStructuresAction,
  getFeeStructureAction,
} from "@/domains/fee-structures/actions";
import { updateContractTemplateAction } from "../../../actions";
import {
  extractRequiredFeeVariables,
  validateFeeStructureCompatibility,
} from "../../../utils/placeholderParser";
import type {
  FeeStructureListItem,
  FeeStructureData,
  FeeStructureCompatibility,
  UseFeeStructuresReturn,
} from "../types";

type UseFeeStructuresParams = {
  templateId: string;
  initialFeeStructureId: string | null;
  content: string;
};

export function useFeeStructures({
  templateId,
  initialFeeStructureId,
  content,
}: UseFeeStructuresParams): UseFeeStructuresReturn {
  const router = useRouter();
  const [feeStructures, setFeeStructures] = useState<FeeStructureListItem[]>(
    [],
  );
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState<string>(
    initialFeeStructureId || "",
  );
  const [selectedFeeStructureData, setSelectedFeeStructureData] =
    useState<FeeStructureData | null>(null);
  const [isLoadingFeeStructures, setIsLoadingFeeStructures] = useState(false);
  const [isUpdatingFeeStructure, setIsUpdatingFeeStructure] = useState(false);
  const [feeStructureCompatibility, setFeeStructureCompatibility] =
    useState<FeeStructureCompatibility>(null);

  // Sync selectedFeeStructureId with template prop when it changes (e.g., after router.refresh())
  useEffect(() => {
    setSelectedFeeStructureId(initialFeeStructureId || "");
  }, [initialFeeStructureId]);

  // Load fee structures list on mount
  useEffect(() => {
    const loadFeeStructures = async () => {
      setIsLoadingFeeStructures(true);
      try {
        const result = await listFeeStructuresAction({ status: "ACTIVE" });
        if ("error" in result) {
          const errorMessage = result.error ?? "Failed to load fee structures";
          console.error("Failed to load fee structures:", errorMessage);
          toast.error(errorMessage);
          return;
        }
        if (result.data) {
          setFeeStructures(result.data);
        }
      } catch (error) {
        console.error("Error loading fee structures:", error);
        toast.error("Failed to load fee structures");
      } finally {
        setIsLoadingFeeStructures(false);
      }
    };
    loadFeeStructures();
  }, []);

  // Load full fee structure data when selected
  useEffect(() => {
    const loadFeeStructureData = async () => {
      if (!selectedFeeStructureId) {
        setSelectedFeeStructureData(null);
        return;
      }

      try {
        const result = await getFeeStructureAction(selectedFeeStructureId);
        if ("error" in result) {
          return;
        }
        if (result.data) {
          setSelectedFeeStructureData(result.data);
        }
      } catch (error) {
        console.error("Error loading fee structure data:", error);
      }
    };

    loadFeeStructureData();
  }, [selectedFeeStructureId]);

  // Validate fee structure compatibility when content or fee structure changes
  useEffect(() => {
    if (selectedFeeStructureData) {
      const requiredFeeVars = extractRequiredFeeVariables(content);
      const compatibility = validateFeeStructureCompatibility(
        requiredFeeVars,
        selectedFeeStructureData.variables || [],
      );
      setFeeStructureCompatibility(compatibility);
    } else {
      setFeeStructureCompatibility(null);
    }
  }, [content, selectedFeeStructureData]);

  const handleFeeStructureChange = useCallback(
    async (feeStructureId: string) => {
      // Allow clearing fee structure (__none__ value)
      const actualFeeStructureId =
        feeStructureId === "__none__" ? "" : feeStructureId;
      setSelectedFeeStructureId(actualFeeStructureId);
      setIsUpdatingFeeStructure(true);
      try {
        const result = await updateContractTemplateAction({
          id: templateId,
          feeStructureId: actualFeeStructureId || null,
        });
        if ("error" in result) {
          toast.error(result.error ?? "Failed to update fee structure");
          setSelectedFeeStructureId(initialFeeStructureId || "");
          return;
        }
        toast.success(
          feeStructureId
            ? "Fee structure updated successfully"
            : "Fee structure removed successfully",
        );
        router.refresh();
      } catch (error) {
        console.error("Error updating fee structure:", error);
        toast.error("Failed to update fee structure");
        setSelectedFeeStructureId(initialFeeStructureId || "");
      } finally {
        setIsUpdatingFeeStructure(false);
      }
    },
    [templateId, initialFeeStructureId, router],
  );

  return {
    feeStructures,
    selectedFeeStructureId,
    selectedFeeStructureData,
    isLoadingFeeStructures,
    isUpdatingFeeStructure,
    feeStructureCompatibility,
    setSelectedFeeStructureId,
    handleFeeStructureChange,
  };
}
