'use client';

import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useVariablesPanel } from './hooks';
import {
  VariablesPanelTabs,
  VariablesTabContent,
  CustomVariablesTabContent,
  PlaceholdersTabContent,
} from './components';
import type { VariablesPanelProps } from '../../types/variablesPanel.types';

export function VariablesPanel({
  placeholders,
  validation,
  availableVariables,
  validVariablesSet,
  systemVariables,
  customVariables,
  feeStructures,
  selectedFeeStructureId,
  selectedFeeStructureData,
  isLoadingFeeStructures,
  isUpdatingFeeStructure,
  feeStructureCompatibility,
  content,
  onFeeStructureChange,
  onInsertPlaceholder,
  onEditVariable,
  onAddCustomVariable,
}: VariablesPanelProps) {
  const { isOpen, activeTab, toggleOpen, setActiveTab } = useVariablesPanel();

  return (
    <div className="overflow-hidden rounded-xl border border-[#E9EDEE] bg-white sm:rounded-2xl md:rounded-[28px]">
      {/* Panel Header - Collapsible */}
      <button
        onClick={toggleOpen}
        className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50 sm:px-5 md:px-6"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-poppins text-sm font-semibold text-gray-900 sm:text-base">
            Variables & Placeholders
          </h3>
          <span className="font-poppins text-xs text-gray-500">
            ({placeholders.length} detected)
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="border-t border-gray-100 px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6">
          {/* Tabs Navigation */}
          <VariablesPanelTabs
            activeTab={activeTab}
            placeholdersCount={placeholders.length}
            customVariablesCount={customVariables.length}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="max-h-[500px] overflow-y-auto">
            {/* Variables Tab */}
            {activeTab === 'variables' && (
              <VariablesTabContent
                availableVariables={availableVariables}
                systemVariables={systemVariables}
                customVariables={customVariables}
                feeStructures={feeStructures}
                selectedFeeStructureId={selectedFeeStructureId}
                selectedFeeStructureData={selectedFeeStructureData}
                isLoadingFeeStructures={isLoadingFeeStructures}
                isUpdatingFeeStructure={isUpdatingFeeStructure}
                feeStructureCompatibility={feeStructureCompatibility}
                content={content}
                onFeeStructureChange={onFeeStructureChange}
                onInsertPlaceholder={onInsertPlaceholder}
                onEditVariable={onEditVariable}
              />
            )}

            {/* Custom Variables Tab */}
            {activeTab === 'custom' && (
              <CustomVariablesTabContent
                customVariables={customVariables}
                onInsertPlaceholder={onInsertPlaceholder}
                onEditVariable={onEditVariable}
                onAddCustomVariable={onAddCustomVariable}
              />
            )}

            {/* Detected Placeholders Tab */}
            {activeTab === 'placeholders' && placeholders.length > 0 && (
              <PlaceholdersTabContent
                placeholders={placeholders}
                validation={validation}
                validVariablesSet={validVariablesSet}
              />
            )}

            {/* Empty state for placeholders */}
            {activeTab === 'placeholders' && placeholders.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-poppins mb-1 text-sm font-medium">
                  No placeholders detected yet
                </p>
                <p className="text-xs text-gray-400">
                  Add variables to your template to see them here
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
