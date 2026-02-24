'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CustomVariablesTabContentProps } from '../../../types/variablesPanel.types';

export function CustomVariablesTabContent({
  customVariables,
  onInsertPlaceholder,
  onEditVariable,
  onAddCustomVariable,
}: CustomVariablesTabContentProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button
          onClick={onAddCustomVariable}
          className="font-poppins flex h-8 items-center gap-1.5 rounded-full px-3 text-xs transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          ref={el => {
            if (el) {
              el.style.setProperty('background-color', '#000080', 'important');
              el.style.setProperty('color', 'white', 'important');
            }
          }}
          onMouseEnter={e => {
            e.currentTarget.style.setProperty('background-color', '#000093', 'important');
          }}
          onMouseLeave={e => {
            e.currentTarget.style.setProperty('background-color', '#000080', 'important');
          }}
        >
          <Plus className="h-4 w-4" />
          Add Custom Variable
        </Button>
      </div>

      {customVariables.length > 0 ? (
        <div className="space-y-3">
          {customVariables.map(variable => {
            return (
              <div
                key={variable.id}
                className="flex items-start gap-2 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 sm:gap-3 sm:p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onInsertPlaceholder(variable.key);
                      }}
                      className="cursor-pointer break-all font-mono text-xs text-[#00A8FF] hover:underline sm:text-sm"
                    >
                      {`{{${variable.key}}}`}
                    </button>
                    {variable.variableType === 'checkbox_group' && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        Checkbox Group
                      </span>
                    )}
                  </div>
                  <p className="mb-1 break-words text-[10px] text-gray-600 sm:text-xs">
                    {variable.description || 'No description'}
                  </p>
                  {variable.variableType === 'text' ? (
                    <p className="break-words break-all font-mono text-[10px] text-gray-500 sm:text-xs">
                      Default: {variable.defaultValue}
                    </p>
                  ) : variable.variableType === 'checkbox_group' && variable.options ? (
                    <div className="mt-2">
                      <p className="mb-1 text-[10px] text-gray-500 sm:text-xs">
                        Options ({variable.options.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {variable.options.map((opt, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-700"
                          >
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={() => onEditVariable(variable)}
                  className="shrink-0 cursor-pointer whitespace-nowrap text-[10px] text-blue-600 hover:text-blue-700 sm:text-xs"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="font-poppins mb-2 text-sm text-gray-500">No custom variables created yet</p>
          <p className="font-poppins text-xs text-gray-400">
            Custom variables will appear here once created
          </p>
        </div>
      )}
    </div>
  );
}
