"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  saveTemplateDraftContentAction,
  publishTemplateVersionAction,
  updateContractTemplateAction,
  getGoogleDocUrlAction,
} from "../../../actions";
import {
  extractRequiredFeeVariables,
  validateFeeStructureCompatibility,
} from "../../../utils/placeholderParser";
import type { HeaderConfig, FooterConfig } from "@/components/editor/types";
import type { FeeStructureData } from "@/domains/fee-structures/types/feeStructure.types";
import type { UseTemplateSaveReturn } from "../../../types/hooks.types";

type UseTemplateSaveParams = {
  templateId: string;
  content: string;
  headerConfig: HeaderConfig | undefined;
  footerConfig: FooterConfig | undefined;
  selectedFeeStructureId: string;
  selectedFeeStructureData: FeeStructureData | null;
  setGoogleDocUrl: (url: string | null) => void;
};

export function useTemplateSave({
  templateId,
  content,
  headerConfig,
  footerConfig,
  selectedFeeStructureId,
  selectedFeeStructureData,
  setGoogleDocUrl,
}: UseTemplateSaveParams): UseTemplateSaveReturn {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    // Validate fee structure compatibility before saving
    if (selectedFeeStructureData) {
      const requiredFeeVars = extractRequiredFeeVariables(content);
      const compatibility = validateFeeStructureCompatibility(
        requiredFeeVars,
        selectedFeeStructureData.variables || [],
      );

      if (!compatibility.compatible) {
        toast.error(
          `Fee structure is missing required variables: ${compatibility.missingVariables.join(", ")}`,
        );
        return;
      }
    }

    // Check if template has fee variables but no fee structure selected
    const requiredFeeVars = extractRequiredFeeVariables(content);
    if (requiredFeeVars.size > 0 && !selectedFeeStructureId) {
      toast.error(
        "Template uses fee variables. Please select a compatible fee structure before saving.",
      );
      return;
    }

    setIsSaving(true);
    try {
      // Save template content
      const result = await saveTemplateDraftContentAction({
        templateId,
        content,
        headerConfig: headerConfig || null,
        footerConfig: footerConfig || null,
      });

      if ("error" in result) {
        toast.error(result.error ?? "Failed to save template");
        return;
      }

      // Always save fee structure to ensure it's persisted with the template
      // This ensures the fee structure is saved even if it was changed via dropdown
      // Convert empty string to null for proper database storage
      const feeStructureIdToSave =
        selectedFeeStructureId && selectedFeeStructureId.trim()
          ? selectedFeeStructureId
          : null;
      const feeStructureResult = await updateContractTemplateAction({
        id: templateId,
        feeStructureId: feeStructureIdToSave,
      });
      if ("error" in feeStructureResult) {
        console.error(
          "Error updating fee structure:",
          feeStructureResult.error,
        );
        // Don't fail the save if fee structure update fails, but log it
        toast.error(
          `Template saved, but fee structure update failed: ${feeStructureResult.error}`,
        );
      }

      // Update Google Doc URL if a new document ID was returned
      if (result.data?.googleDocId) {
        const newUrl = `https://docs.google.com/document/d/${result.data.googleDocId}/edit`;
        setGoogleDocUrl(newUrl);
      } else {
        // Reload Google Doc URL from database in case it was updated
        const urlResult = await getGoogleDocUrlAction({ templateId });
        if (!("error" in urlResult) && urlResult.data?.url) {
          setGoogleDocUrl(urlResult.data.url);
        }
      }

      // After saving, publish it immediately to make it the current version
      const publishResult = await publishTemplateVersionAction({ templateId });

      if ("error" in publishResult) {
        toast.error(publishResult.error ?? "Failed to save template");
        return;
      }

      toast.success("Template saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  }, [
    templateId,
    content,
    headerConfig,
    footerConfig,
    selectedFeeStructureId,
    selectedFeeStructureData,
    setGoogleDocUrl,
    router,
  ]);

  return {
    isSaving,
    handleSave,
  };
}
