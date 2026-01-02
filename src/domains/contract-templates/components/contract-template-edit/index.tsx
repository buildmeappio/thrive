"use client";

import { useState, useRef } from "react";
import { FileText } from "lucide-react";
import CustomVariableDialog from "@/domains/custom-variables/components/CustomVariableDialog";

import {
  useVariables,
  useFeeStructures,
  useGoogleDocsSync,
  usePlaceholders,
  useTemplateSave,
} from "./hooks";
import { TemplateHeader } from "./TemplateHeader";
import { EditorSection } from "./EditorSection";
import { PreviewSection } from "./PreviewSection";
import { VariablesPanel } from "./VariablesPanel";
import { SyncConfirmDialog } from "./SyncConfirmDialog";

import type {
  ContractTemplateEditContentProps,
  HeaderConfig,
  FooterConfig,
} from "./types";

/**
 * Variable types
 * 1. Static
 * 2. Referenced (from other data sources)
 * 3. Custom (take via user input)
 * 4. Fee structure (specific fee structure taken via user input)
 */

export default function ContractTemplateEditContent({
  template,
}: ContractTemplateEditContentProps) {
  // Editor state
  const [content, setContent] = useState(
    template.currentVersion?.bodyHtml || "",
  );
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | undefined>(
    template.currentVersion?.headerConfig as HeaderConfig | undefined,
  );
  const [footerConfig, setFooterConfig] = useState<FooterConfig | undefined>(
    template.currentVersion?.footerConfig as FooterConfig | undefined,
  );
  const editorRef = useRef<unknown>(null);

  // Variables hook
  const {
    systemVariables,
    customVariables,
    editingVariable,
    isVariableDialogOpen,
    isUpdatingVariable,
    isCreatingVariable,
    setEditingVariable,
    setIsVariableDialogOpen,
    handleVariableUpdate,
  } = useVariables();

  // Fee structures hook
  const {
    feeStructures,
    selectedFeeStructureId,
    selectedFeeStructureData,
    isLoadingFeeStructures,
    isUpdatingFeeStructure,
    feeStructureCompatibility,
    handleFeeStructureChange,
  } = useFeeStructures({
    templateId: template.id,
    initialFeeStructureId: template.feeStructureId,
    content,
  });

  // Google Docs sync hook
  const {
    googleDocUrl,
    isLoadingGoogleDocUrl,
    isSyncingFromGDocs,
    showSyncConfirmDialog,
    setGoogleDocUrl,
    setShowSyncConfirmDialog,
    handleSyncFromGoogleDocsClick,
    handleConfirmSyncFromGoogleDocs,
  } = useGoogleDocsSync({
    templateId: template.id,
    editorRef,
    setContent,
  });

  // Placeholders hook
  const {
    placeholders,
    validation,
    availableVariables,
    validVariablesSet,
    variableValuesMap,
    insertPlaceholder,
  } = usePlaceholders({
    content,
    systemVariables,
    customVariables,
    selectedFeeStructureData,
    editorRef,
  });

  // Template save hook
  const { isSaving, handleSave } = useTemplateSave({
    templateId: template.id,
    content,
    headerConfig,
    footerConfig,
    selectedFeeStructureId,
    selectedFeeStructureData,
    setGoogleDocUrl,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <TemplateHeader
        displayName={template.displayName}
        isActive={template.isActive}
        googleDocUrl={googleDocUrl}
        isLoadingGoogleDocUrl={isLoadingGoogleDocUrl}
        isSaving={isSaving}
        validation={validation}
        feeStructureCompatibility={feeStructureCompatibility}
        onSyncFromGoogleDocsClick={handleSyncFromGoogleDocsClick}
        onSave={handleSave}
      />

      {/* Google Docs Sync Status */}
      {!isLoadingGoogleDocUrl && !googleDocUrl && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3">
          <FileText className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-amber-700 font-poppins">
            No Google Doc linked yet. Save the template to automatically create
            and link a Google Doc for collaborative editing.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-4 sm:space-y-6">
        {/* Editor and Preview - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:min-h-[600px]">
          {/* Editor Section */}
          <EditorSection
            content={content}
            onContentChange={setContent}
            placeholderCount={placeholders.length}
            editorRef={editorRef}
            validVariablesSet={validVariablesSet}
            availableVariables={availableVariables}
            variableValuesMap={variableValuesMap}
            customVariables={customVariables}
            headerConfig={headerConfig}
            footerConfig={footerConfig}
            onHeaderChange={setHeaderConfig}
            onFooterChange={setFooterConfig}
          />

          {/* Preview Section */}
          <PreviewSection
            content={content}
            headerConfig={headerConfig}
            footerConfig={footerConfig}
            variableValuesMap={variableValuesMap}
            customVariables={customVariables}
          />
        </div>

        {/* Variables and Placeholders Panel */}
        <VariablesPanel
          placeholders={placeholders}
          validation={validation}
          availableVariables={availableVariables}
          validVariablesSet={validVariablesSet}
          systemVariables={systemVariables}
          customVariables={customVariables}
          feeStructures={feeStructures}
          selectedFeeStructureId={selectedFeeStructureId}
          selectedFeeStructureData={selectedFeeStructureData}
          isLoadingFeeStructures={isLoadingFeeStructures}
          isUpdatingFeeStructure={isUpdatingFeeStructure}
          feeStructureCompatibility={feeStructureCompatibility}
          content={content}
          onFeeStructureChange={handleFeeStructureChange}
          onInsertPlaceholder={insertPlaceholder}
          onEditVariable={(variable) => {
            setEditingVariable(variable);
            setIsVariableDialogOpen(true);
          }}
          onAddCustomVariable={() => {
            setEditingVariable(null);
            setIsVariableDialogOpen(true);
          }}
        />
      </div>

      {/* Sync from Google Docs Confirmation Dialog */}
      <SyncConfirmDialog
        open={showSyncConfirmDialog}
        onOpenChange={setShowSyncConfirmDialog}
        isSyncing={isSyncingFromGDocs}
        onCancel={() => setShowSyncConfirmDialog(false)}
        onConfirm={handleConfirmSyncFromGoogleDocs}
      />

      {/* Variable Edit Dialog */}
      <CustomVariableDialog
        open={isVariableDialogOpen}
        onClose={() => {
          setIsVariableDialogOpen(false);
          setEditingVariable(null);
        }}
        onSubmit={handleVariableUpdate}
        initialData={editingVariable}
        isLoading={isUpdatingVariable || isCreatingVariable}
      />
    </div>
  );
}
