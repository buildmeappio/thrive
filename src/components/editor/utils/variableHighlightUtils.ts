import { ALLOWED_NAMESPACES } from "../constants";

/**
 * Utility function to highlight a single variable placeholder
 * Used when inserting variables into the editor
 */
export function highlightVariable(
  placeholder: string,
  validVariables: Set<string>,
): string {
  const key = placeholder.trim();
  if (!key) return placeholder;

  // Validate variable
  const isInValidSet = validVariables.has(key);
  const hasValidNamespace = key.includes(".")
    ? ALLOWED_NAMESPACES.includes(key.split(".")[0])
    : true;

  // For fee variables, check if format is valid even if not in validVariablesSet
  // This allows users to add fee variables before selecting a fee structure
  // or when the variable exists in a different fee structure
  // Supports both simple variables (fees.base_exam_fee) and composite sub-fields (fees.late_cancellation.hours)
  const isFeeVariable = key.startsWith("fees.");
  const feeVariableFormatValid = isFeeVariable
    ? /^fees\.[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/.test(key)
    : false;

  const isValid = (isInValidSet || feeVariableFormatValid) && hasValidNamespace;

  const className = isValid
    ? "variable-valid bg-[#E0F7FA] text-[#006064] px-1 py-0.5 rounded font-mono text-sm underline"
    : "variable-invalid bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono text-sm underline";

  return `<span class="${className}" data-variable="${key}" data-is-valid="${isValid}" contenteditable="false">${placeholder}</span>`;
}
