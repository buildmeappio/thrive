import { useMemo } from "react";
import { highlightVariable as highlightVariableUtil } from "../utils/variableHighlightUtils";

/**
 * Hook for variable highlighting logic
 * Provides a function to highlight a single variable placeholder
 */
export function useVariableHighlighting(validVariables: Set<string>) {
  // Serialize Set for dependency tracking
  const validVariablesKey = useMemo(
    () => Array.from(validVariables).sort().join("|"),
    [validVariables]
  );

  // Function to highlight a single variable placeholder
  const highlightVariable = useMemo(
    () => (placeholder: string): string => {
      return highlightVariableUtil(placeholder, validVariables);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validVariablesKey] // validVariablesKey tracks Set contents changes
  );

  return {
    highlightVariable,
  };
}

