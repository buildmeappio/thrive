"use client";

import type { VariablesPanelTabsProps } from "../../../types/variablesPanel.types";

export function VariablesPanelTabs({
  activeTab,
  placeholdersCount,
  customVariablesCount,
  onTabChange,
}: VariablesPanelTabsProps) {
  return (
    <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto pt-4">
      <button
        onClick={() => onTabChange("variables")}
        className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
          activeTab === "variables"
            ? "border-[#00A8FF] text-[#00A8FF] bg-[#00A8FF]/5"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        Variables
      </button>
      <button
        onClick={() => onTabChange("custom")}
        className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
          activeTab === "custom"
            ? "border-[#00A8FF] text-[#00A8FF] bg-[#00A8FF]/5"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        Custom Variables
        {customVariablesCount > 0 && (
          <span className="ml-1.5 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold text-white bg-[#00A8FF] rounded-full">
            {customVariablesCount}
          </span>
        )}
      </button>
      {placeholdersCount > 0 && (
        <button
          onClick={() => onTabChange("placeholders")}
          className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 relative cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "placeholders"
              ? "border-[#00A8FF] text-[#00A8FF] bg-[#00A8FF]/5"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Detected
          <span className="ml-1.5 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold text-white bg-[#00A8FF] rounded-full">
            {placeholdersCount}
          </span>
        </button>
      )}
    </div>
  );
}
