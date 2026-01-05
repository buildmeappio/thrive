"use client";

import type { PlaceholdersTabContentProps } from "../../../types/variablesPanel.types";

export function PlaceholdersTabContent({
  placeholders,
  validation,
  validVariablesSet,
}: PlaceholdersTabContentProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
        <p className="text-xs sm:text-sm text-blue-800 font-poppins font-medium">
          {placeholders.length} placeholder
          {placeholders.length !== 1 ? "s" : ""} detected in your template
        </p>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm font-semibold text-red-800 mb-2 font-poppins flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-red-800 text-xs font-bold">
              !
            </span>
            Validation Errors ({validation.errors.length})
          </p>
          <div className="space-y-1.5 mt-2">
            {validation.errors.map((error, idx) => (
              <div
                key={idx}
                className="text-xs sm:text-sm text-red-700 font-poppins break-words pl-7"
              >
                <span className="font-mono font-semibold">{`{{${error.placeholder}}}`}</span>
                <span className="ml-2">- {error.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs sm:text-sm font-semibold text-amber-800 mb-2 font-poppins flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">
              ⚠
            </span>
            Warnings ({validation.warnings.length})
          </p>
          <div className="space-y-1.5 mt-2">
            {validation.warnings.map((warning, idx) => (
              <div
                key={idx}
                className="text-xs sm:text-sm text-amber-700 font-poppins break-words pl-7"
              >
                <span className="font-mono font-semibold">{`{{${warning.placeholder}}}`}</span>
                <span className="ml-2">- {warning.warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {placeholders.map((placeholder) => {
          const hasError = validation.errors.some(
            (e) => e.placeholder === placeholder,
          );
          const hasWarning = validation.warnings.some(
            (w) => w.placeholder === placeholder,
          );
          const isValid = validVariablesSet.has(placeholder);
          const isInvalid = !isValid && !hasError && !hasWarning;

          return (
            <div
              key={placeholder}
              className={`text-xs sm:text-sm font-mono px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                hasError
                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  : isInvalid
                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    : hasWarning
                      ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span className="break-all">{`{{${placeholder}}}`}</span>
              {isInvalid && (
                <span className="text-xs text-red-600 font-poppins ml-2 whitespace-nowrap shrink-0 font-medium">
                  Invalid
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
