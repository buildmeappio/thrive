"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomVariablesTabContentProps } from "../../../types/variablesPanel.types";

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
          className="h-8 px-3 text-xs font-poppins rounded-full flex items-center gap-1.5 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          ref={(el) => {
            if (el) {
              el.style.setProperty("background-color", "#000080", "important");
              el.style.setProperty("color", "white", "important");
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.setProperty(
              "background-color",
              "#000093",
              "important",
            );
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.setProperty(
              "background-color",
              "#000080",
              "important",
            );
          }}
        >
          <Plus className="h-4 w-4" />
          Add Custom Variable
        </Button>
      </div>

      {customVariables.length > 0 ? (
        <div className="space-y-3">
          {customVariables.map((variable) => {
            return (
              <div
                key={variable.id}
                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onInsertPlaceholder(variable.key);
                      }}
                      className="font-mono text-xs sm:text-sm text-[#00A8FF] hover:underline cursor-pointer break-all"
                    >
                      {`{{${variable.key}}}`}
                    </button>
                    {variable.variableType === "checkbox_group" && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                        Checkbox Group
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1 break-words">
                    {variable.description || "No description"}
                  </p>
                  {variable.variableType === "text" ? (
                    <p className="text-[10px] sm:text-xs text-gray-500 font-mono break-all break-words">
                      Default: {variable.defaultValue}
                    </p>
                  ) : variable.variableType === "checkbox_group" &&
                    variable.options ? (
                    <div className="mt-2">
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                        Options ({variable.options.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {variable.options.map((opt, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono"
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
                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 font-poppins mb-2">
            No custom variables created yet
          </p>
          <p className="text-xs text-gray-400 font-poppins">
            Custom variables will appear here once created
          </p>
        </div>
      )}
    </div>
  );
}
