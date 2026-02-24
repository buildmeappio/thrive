'use client';

import type { VariablesPanelTabsProps } from '../../../types/variablesPanel.types';

export function VariablesPanelTabs({
  activeTab,
  placeholdersCount,
  customVariablesCount,
  onTabChange,
}: VariablesPanelTabsProps) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200 pt-4 sm:mb-6 sm:gap-2">
      <button
        onClick={() => onTabChange('variables')}
        className={`font-poppins shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
          activeTab === 'variables'
            ? 'border-[#00A8FF] bg-[#00A8FF]/5 text-[#00A8FF]'
            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
        }`}
      >
        Variables
      </button>
      <button
        onClick={() => onTabChange('custom')}
        className={`font-poppins shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
          activeTab === 'custom'
            ? 'border-[#00A8FF] bg-[#00A8FF]/5 text-[#00A8FF]'
            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
        }`}
      >
        Custom Variables
        {customVariablesCount > 0 && (
          <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#00A8FF] text-[10px] font-bold text-white sm:ml-2 sm:h-5 sm:w-5 sm:text-xs">
            {customVariablesCount}
          </span>
        )}
      </button>
      {placeholdersCount > 0 && (
        <button
          onClick={() => onTabChange('placeholders')}
          className={`font-poppins relative shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
            activeTab === 'placeholders'
              ? 'border-[#00A8FF] bg-[#00A8FF]/5 text-[#00A8FF]'
              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          Detected
          <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#00A8FF] text-[10px] font-bold text-white sm:ml-2 sm:h-5 sm:w-5 sm:text-xs">
            {placeholdersCount}
          </span>
        </button>
      )}
    </div>
  );
}
