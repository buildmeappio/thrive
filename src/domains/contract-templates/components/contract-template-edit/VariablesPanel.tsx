"use client";

import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useVariablesPanel } from "./hooks";
import {
  VariablesPanelTabs,
  VariablesTabContent,
  CustomVariablesTabContent,
  PlaceholdersTabContent,
} from "./components";
import type { VariablesPanelProps } from "../../types/variablesPanel.types";

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
    <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white overflow-hidden">
      {/* Panel Header - Collapsible */}
      <button
        onClick={toggleOpen}
        className="w-full px-4 sm:px-5 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-poppins font-semibold text-sm sm:text-base text-gray-900">
            Variables & Placeholders
          </h3>
          <span className="text-xs text-gray-500 font-poppins">
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
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 border-t border-gray-100">
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
            {activeTab === "variables" && (
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
            {activeTab === "custom" && (
              <CustomVariablesTabContent
                customVariables={customVariables}
                onInsertPlaceholder={onInsertPlaceholder}
                onEditVariable={onEditVariable}
                onAddCustomVariable={onAddCustomVariable}
              />
            )}

            {/* Detected Placeholders Tab */}
            {activeTab === "placeholders" && placeholders.length > 0 && (
              <PlaceholdersTabContent
                placeholders={placeholders}
                validation={validation}
                validVariablesSet={validVariablesSet}
              />
            )}

            {/* Empty state for placeholders */}
            {activeTab === "placeholders" && placeholders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-poppins font-medium mb-1">
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
