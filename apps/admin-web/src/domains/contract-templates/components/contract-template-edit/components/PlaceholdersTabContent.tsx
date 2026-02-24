'use client';

import type { PlaceholdersTabContentProps } from '../../../types/variablesPanel.types';

export function PlaceholdersTabContent({
  placeholders,
  validation,
  validVariablesSet,
}: PlaceholdersTabContentProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
        <p className="font-poppins text-xs font-medium text-blue-800 sm:text-sm">
          {placeholders.length} placeholder
          {placeholders.length !== 1 ? 's' : ''} detected in your template
        </p>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
          <p className="font-poppins mb-2 flex items-center gap-2 text-xs font-semibold text-red-800 sm:text-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-800">
              !
            </span>
            Validation Errors ({validation.errors.length})
          </p>
          <div className="mt-2 space-y-1.5">
            {validation.errors.map((error, idx) => (
              <div
                key={idx}
                className="font-poppins break-words pl-7 text-xs text-red-700 sm:text-sm"
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:p-4">
          <p className="font-poppins mb-2 flex items-center gap-2 text-xs font-semibold text-amber-800 sm:text-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
              ⚠
            </span>
            Warnings ({validation.warnings.length})
          </p>
          <div className="mt-2 space-y-1.5">
            {validation.warnings.map((warning, idx) => (
              <div
                key={idx}
                className="font-poppins break-words pl-7 text-xs text-amber-700 sm:text-sm"
              >
                <span className="font-mono font-semibold">{`{{${warning.placeholder}}}`}</span>
                <span className="ml-2">- {warning.warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-[400px] space-y-2 overflow-y-auto">
        {placeholders.map(placeholder => {
          const hasError = validation.errors.some(e => e.placeholder === placeholder);
          const hasWarning = validation.warnings.some(w => w.placeholder === placeholder);
          const isValid = validVariablesSet.has(placeholder);
          const isInvalid = !isValid && !hasError && !hasWarning;

          return (
            <div
              key={placeholder}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 font-mono text-xs transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
                hasError
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : isInvalid
                    ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    : hasWarning
                      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className="break-all">{`{{${placeholder}}}`}</span>
              {isInvalid && (
                <span className="font-poppins ml-2 shrink-0 whitespace-nowrap text-xs font-medium text-red-600">
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
