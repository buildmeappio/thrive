"use client";

import { useMemo, useCallback } from "react";
import {
  parsePlaceholders,
  validatePlaceholders,
} from "../../../utils/placeholderParser";
import type {
  CustomVariable,
  FeeStructureData,
  VariableGroup,
  PlaceholderValidation,
  UsePlaceholdersReturn,
  EditorRef,
} from "../types";

type UsePlaceholdersParams = {
  content: string;
  systemVariables: CustomVariable[];
  customVariables: CustomVariable[];
  selectedFeeStructureData: FeeStructureData | null;
  editorRef: EditorRef;
};

export function usePlaceholders({
  content,
  systemVariables,
  customVariables,
  selectedFeeStructureData,
  editorRef,
}: UsePlaceholdersParams): UsePlaceholdersReturn {
  // Parse and validate placeholders from content
  const placeholders = useMemo(() => parsePlaceholders(content), [content]);

  const validation = useMemo<PlaceholderValidation>(
    () => validatePlaceholders(placeholders),
    [placeholders],
  );

  // Build available variables for display and validation
  const availableVariables = useMemo<VariableGroup[]>(() => {
    // Group system variables by namespace
    const systemVarsByNamespace: Record<string, string[]> = {};
    for (const variable of systemVariables) {
      const firstDotIndex = variable.key.indexOf(".");
      if (firstDotIndex === -1) {
        // No namespace, skip or handle differently
        continue;
      }

      const namespace = variable.key.substring(0, firstDotIndex);
      const key = variable.key.substring(firstDotIndex + 1);

      if (!namespace || !key) {
        continue;
      }

      if (!systemVarsByNamespace[namespace]) {
        systemVarsByNamespace[namespace] = [];
      }
      systemVarsByNamespace[namespace].push(key);
    }

    // Build variables array
    const vars: VariableGroup[] = [];

    // Add system variables from database (thrive, contract, etc.)
    Object.entries(systemVarsByNamespace).forEach(([namespace, keys]) => {
      vars.push({ namespace, vars: keys });
    });

    // Add contract variables that are dynamically calculated (not in DB)
    // These are calculated from contract data at render time
    const contractIndex = vars.findIndex((v) => v.namespace === "contract");
    if (contractIndex >= 0) {
      // Add review_date if not already present
      if (!vars[contractIndex].vars.includes("review_date")) {
        vars[contractIndex].vars.push("review_date");
      }
    } else {
      // Create contract namespace if it doesn't exist
      vars.push({
        namespace: "contract",
        vars: ["review_date"],
      });
    }

    // Add examiner variables (hardcoded as they come from contract data)
    vars.push({
      namespace: "examiner",
      vars: [
        "name",
        "email",
        "phone",
        "province",
        "city",
        "postal_code",
        "signature",
        "signature_date_time",
      ],
    });

    // Add application.examiner variables (hardcoded as they come from application data)
    vars.push({
      namespace: "application",
      vars: [
        "examiner_name",
        "examiner_first_name",
        "examiner_last_name",
        "examiner_email",
        "examiner_phone",
        "examiner_landline_number",
        "examiner_province",
        "examiner_city",
        "examiner_languages_spoken",
        "examiner_license_number",
        "examiner_province_of_licensure",
        "examiner_specialties",
        "examiner_years_of_ime_experience",
        "examiner_imes_completed",
        "examiner_currently_conducting_imes",
        "examiner_assessment_types",
        "examiner_assessment_type_other",
        "examiner_experience_details",
        "examiner_agree_to_terms",
        "examiner_signature",
        "examiner_signature_date_time",
      ],
    });

    // Add fee structure variables
    if (selectedFeeStructureData?.variables) {
      vars.push({
        namespace: "fees",
        vars: selectedFeeStructureData.variables.map((v) => v.key),
      });
    } else {
      vars.push({
        namespace: "fees",
        vars: ["base_exam_fee", "additional_fee", "travel_fee"],
      });
    }

    // Add custom variables
    if (customVariables.length > 0) {
      const customVars = customVariables.map((v) => {
        // Remove "custom." prefix for display
        return v.key.replace(/^custom\./, "");
      });
      vars.push({
        namespace: "custom",
        vars: customVars,
      });
    }

    return vars;
  }, [selectedFeeStructureData, systemVariables, customVariables]);

  // Set of valid variable keys for quick lookup
  const validVariablesSet = useMemo(
    () =>
      new Set(
        availableVariables.flatMap((group) =>
          group.vars.map((v) => `${group.namespace}.${v}`),
        ),
      ),
    [availableVariables],
  );

  // Map of variable keys to their default values for preview
  const variableValuesMap = useMemo(() => {
    const valuesMap = new Map<string, string>();

    // Add system variables with their default values
    systemVariables.forEach((variable) => {
      valuesMap.set(variable.key, variable.defaultValue || "");
    });

    // Add custom variables with their default values
    customVariables.forEach((variable) => {
      valuesMap.set(variable.key, variable.defaultValue || "");
    });

    return valuesMap;
  }, [systemVariables, customVariables]);

  // Insert placeholder into editor with proper highlighting
  const insertPlaceholder = useCallback(
    (placeholder: string) => {
      if (editorRef.current) {
        const editor = editorRef.current;
        const placeholderText = `{{${placeholder}}}`;
        const isValid = validVariablesSet.has(placeholder);

        // Insert the placeholder text with the highlight span already applied
        // This ensures the color shows immediately
        const className = isValid
          ? "variable-valid bg-[#E0F7FA] text-[#006064] px-1 py-0.5 rounded font-mono text-sm"
          : "variable-invalid bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono text-sm";

        const highlightedHtml = `<span class="${className}" data-variable="${placeholder}" data-is-valid="${isValid}">${placeholderText}</span>&nbsp;`;

        // Use insertContent with parseOptions to ensure it's treated as a single node
        (editor as any)
          .chain()
          .focus()
          .insertContent(highlightedHtml, {
            parseOptions: {
              preserveWhitespace: "full",
            },
          })
          .run();
      }
    },
    [editorRef, validVariablesSet],
  );

  return {
    placeholders,
    validation,
    availableVariables,
    validVariablesSet,
    variableValuesMap,
    insertPlaceholder,
  };
}
