"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { MultipleFileUploadInput } from "@/components";
import { DocumentFile, ExistingDocument } from "@/components/FileUploadInput";
import {
  uploadDocumentAction,
  getDocumentByIdAction,
} from "../../server/actions";
import { updateDocumentsAction } from "../../server/actions/updateDocuments";
import type { DocumentsUploadFormProps } from "../../types";

const DocumentsUploadForm: React.FC<DocumentsUploadFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [allFiles, setAllFiles] = useState<DocumentFile[]>([]);

  // Use initial data directly - just get all document IDs from medicalLicenseDocumentIds
  const mergedInitialData = useMemo(() => {
    return {
      documentIds: initialData?.medicalLicenseDocumentIds || [],
    };
  }, [initialData]);

  // Load existing documents from mergedInitialData
  useEffect(() => {
    const loadExistingDocuments = async () => {
      const existingDocs: ExistingDocument[] = [];

      // Load all documents from the single documentIds array
      if (mergedInitialData?.documentIds?.length) {
        const loadedDocs = await Promise.all(
          mergedInitialData.documentIds.map(async (id) => {
            const result = await getDocumentByIdAction(id);
            if (result.success && result.data) {
              return {
                id,
                name: result.data.name,
                displayName: result.data.displayName || result.data.name,
                type: result.data.name.split(".").pop() || "pdf",
                size: result.data.size || 0,
                isExisting: true as const,
                isFromDatabase: true as const, // Mark as loaded from database
              };
            }
            return null;
          }),
        );
        existingDocs.push(
          ...(loadedDocs.filter((doc) => doc !== null) as ExistingDocument[]),
        );
      }

      setAllFiles(existingDocs);
    };

    loadExistingDocuments();
  }, [mergedInitialData]);

  // Track if files have changed from initial state
  const previousFilesRef = React.useRef<string | null>(null);

  useEffect(() => {
    const currentHash = JSON.stringify(
      allFiles.map((f) =>
        f instanceof File ? f.name : (f as ExistingDocument).id,
      ),
    );
    if (
      previousFilesRef.current &&
      previousFilesRef.current !== currentHash &&
      isCompleted &&
      onStepEdited
    ) {
      onStepEdited();
    }
    previousFilesRef.current = currentHash;
  }, [allFiles, isCompleted, onStepEdited]);

  // Check if at least one document is uploaded
  const isFormValid = useMemo(() => {
    return allFiles.length > 0;
  }, [allFiles]);

  // Handle file changes - just update state, don't upload to S3 yet
  const handleFileChange = (files: DocumentFile[]) => {
    // Simply update the state - files will be uploaded when "Mark as Complete" is clicked
    setAllFiles(files);
  };

  const handleSubmit = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Check if at least one document is uploaded
    if (allFiles.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setLoading(true);
    try {
      // Separate existing documents from new files
      const existingDocs = allFiles.filter(
        (file): file is ExistingDocument =>
          file !== null &&
          typeof file === "object" &&
          "isExisting" in file &&
          file.isExisting === true,
      );

      const newFiles = allFiles.filter(
        (file): file is File => file instanceof File,
      );

      // Upload new files to S3 first
      const uploadedDocs: ExistingDocument[] = [];
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const result = await uploadDocumentAction(file);
          if (result.success && result.data) {
            uploadedDocs.push({
              id: result.data.id,
              name: result.data.name,
              displayName: file.name,
              type: file.type || result.data.name.split(".").pop() || "pdf",
              size: result.data.size || file.size,
              isExisting: true as const,
              isFromDatabase: false as const,
            });
          } else {
            throw new Error(
              (!result.success && "message" in result
                ? result.message
                : undefined) || `Failed to upload ${file.name}`,
            );
          }
        }
      }

      // Get all document IDs (both existing and newly uploaded)
      const allDocumentIds = [
        ...existingDocs.map((doc) => doc.id),
        ...uploadedDocs.map((doc) => doc.id),
      ].filter(Boolean) as string[];

      // Save all document IDs to medicalLicenseDocumentIds (used as generic document storage)
      const result = await updateDocumentsAction({
        examinerProfileId,
        medicalLicenseDocumentIds: allDocumentIds,
      });

      if (result.success) {
        toast.success("Documents uploaded successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to save documents");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle "Mark as Complete" - saves and marks step as complete
  const handleMarkComplete = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Check if at least one document is uploaded
    if (allFiles.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setLoading(true);
    try {
      // Separate existing documents from new files
      const existingDocs = allFiles.filter(
        (file): file is ExistingDocument =>
          file !== null &&
          typeof file === "object" &&
          "isExisting" in file &&
          file.isExisting === true,
      );

      const newFiles = allFiles.filter(
        (file): file is File => file instanceof File,
      );

      // Upload new files to S3 first
      const uploadedDocs: ExistingDocument[] = [];
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const result = await uploadDocumentAction(file);
          if (result.success && result.data) {
            uploadedDocs.push({
              id: result.data.id,
              name: result.data.name,
              displayName: file.name,
              type: file.type || result.data.name.split(".").pop() || "pdf",
              size: result.data.size || file.size,
              isExisting: true as const,
              isFromDatabase: false as const,
            });
          } else {
            throw new Error(
              (!result.success && "message" in result
                ? result.message
                : undefined) || `Failed to upload ${file.name}`,
            );
          }
        }
      }

      // Get all document IDs (both existing and newly uploaded)
      const allDocumentIds = [
        ...existingDocs.map((doc) => doc.id),
        ...uploadedDocs.map((doc) => doc.id),
      ].filter(Boolean) as string[];

      // Save all document IDs to medicalLicenseDocumentIds (used as generic document storage)
      const result = await updateDocumentsAction({
        examinerProfileId,
        medicalLicenseDocumentIds: allDocumentIds,
      });

      if (result.success) {
        toast.success("Documents uploaded and marked as complete");
        // Mark step as complete
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
        onComplete();
      } else {
        toast.error(result.message || "Failed to save documents");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            Upload Verification Documents
          </h2>
        </div>
        {/* Mark as Complete Button - Top Right */}
        {!isCompleted && (
          <Button
            type="submit"
            onClick={handleMarkComplete}
            form="documents-upload-form"
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !isFormValid}
          >
            <span>Mark as Complete</span>
            <CircleCheck className="w-5 h-5 text-gray-700" />
          </Button>
        )}
      </div>

      {/* Single Upload Area */}
      <div className="mt-8">
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
    </div>
  );
};

export default DocumentsUploadForm;
