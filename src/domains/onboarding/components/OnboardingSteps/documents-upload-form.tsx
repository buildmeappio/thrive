"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { MultipleFileUploadInput } from "@/components";
import { useDocumentLoading, useDocumentsFormSubmission } from "../../hooks";
import type { DocumentsUploadFormProps } from "../../types";

const DocumentsUploadForm: React.FC<DocumentsUploadFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
  isSettingsPage = false,
  onDataUpdate,
}) => {
  const {
    allFiles,
    setAllFiles,
    loading: loadingDocuments,
  } = useDocumentLoading({
    documentIds: initialData?.medicalLicenseDocumentIds,
  });

  const {
    handleSubmit,
    handleMarkComplete,
    handleFileChange,
    loading: submitting,
  } = useDocumentsFormSubmission({
    examinerProfileId,
    allFiles,
    setAllFiles,
    isCompleted,
    onStepEdited,
    onComplete,
    onMarkComplete,
    onDataUpdate,
    isSettingsPage,
  });

  const loading = loadingDocuments || submitting;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm relative">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage ? "Documents" : "Upload Verification Documents"}
          </h2>
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <span>Mark as Complete</span>
            <CircleCheck className="w-5 h-5 text-gray-700" />
          </Button>
        )}
      </div>

      {/* Single Upload Area */}
      <div className={`mt-8 ${isSettingsPage ? "pb-20" : ""}`}>
        <MultipleFileUploadInput
          name="documents"
          label="Required Documents"
          value={allFiles}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          required
          placeholder="Click to upload or drag and drop files here"
          showIcon={true}
          className="w-full"
        />
      </div>
      {/* Save Changes Button - Bottom Right (Settings only) */}
      {isSettingsPage && (
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[#00A8FF] text-white hover:bg-[#0090d9] px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            disabled={loading}
          >
            <span>Save Changes</span>
            <CircleCheck className="w-5 h-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentsUploadForm;
