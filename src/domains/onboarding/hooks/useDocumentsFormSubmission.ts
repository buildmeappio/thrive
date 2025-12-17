"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { DocumentFile, ExistingDocument } from "@/components/FileUploadInput";
import { uploadDocumentAction } from "../server/actions";
import { updateDocumentsAction } from "../server/actions/updateDocuments";

interface UseDocumentsFormSubmissionOptions {
  examinerProfileId: string | null;
  allFiles: DocumentFile[];
  setAllFiles: (files: DocumentFile[]) => void;
  isCompleted?: boolean;
  onStepEdited?: () => void;
  onComplete: () => void;
  onMarkComplete?: () => void;
  onDataUpdate?: (data: { medicalLicenseDocumentIds?: string[] }) => void;
  isSettingsPage?: boolean;
}

/**
 * Hook for handling documents form submission and change detection
 */
export function useDocumentsFormSubmission({
  examinerProfileId,
  allFiles,
  setAllFiles,
  isCompleted = false,
  onStepEdited,
  onComplete,
  onMarkComplete,
  onDataUpdate,
  isSettingsPage = false,
}: UseDocumentsFormSubmissionOptions) {
  const [loading, setLoading] = useState(false);
  const previousFilesRef = useRef<string | null>(null);
  const initialFilesHashRef = useRef<string | null>(null);

  // Store initial files hash on first load
  useEffect(() => {
    if (!initialFilesHashRef.current) {
      const initialHash = JSON.stringify(
        allFiles.map((f) =>
          f instanceof File ? f.name : (f as ExistingDocument).id,
        ),
      );
      initialFilesHashRef.current = initialHash;
      previousFilesRef.current = initialHash;
    }
  }, []);

  // Check if files have changed from initial state
  const hasFormChanged = useMemo(() => {
    if (!initialFilesHashRef.current) return false;
    const currentHash = JSON.stringify(
      allFiles.map((f) =>
        f instanceof File ? f.name : (f as ExistingDocument).id,
      ),
    );
    return currentHash !== initialFilesHashRef.current;
  }, [allFiles]);

  useEffect(() => {
    if (hasFormChanged && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [hasFormChanged, isCompleted, onStepEdited]);

  // Check if at least one document is uploaded
  const isFormValid = useMemo(() => {
    return allFiles.length > 0;
  }, [allFiles]);

  const handleFileChange = (files: DocumentFile[]) => {
    setAllFiles(files);
  };

  const processFiles = async (): Promise<string[]> => {
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

    return allDocumentIds;
  };

  const handleSubmit = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
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
      const allDocumentIds = await processFiles();

      // Save all document IDs to medicalLicenseDocumentIds (used as generic document storage)
      const result = await updateDocumentsAction({
        examinerProfileId,
        medicalLicenseDocumentIds: allDocumentIds,
      });

      if (result.success) {
        // Update initial files hash
        const currentHash = JSON.stringify(
          allFiles.map((f) =>
            f instanceof File ? f.name : (f as ExistingDocument).id,
          ),
        );
        initialFilesHashRef.current = currentHash;
        previousFilesRef.current = currentHash;

        // Update parent component's data state if callback is provided (for settings page)
        if (onDataUpdate && isSettingsPage) {
          onDataUpdate({ medicalLicenseDocumentIds: allDocumentIds });
        }

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

  const handleMarkComplete = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
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
      const allDocumentIds = await processFiles();

      // Save all document IDs to medicalLicenseDocumentIds (used as generic document storage)
      const result = await updateDocumentsAction({
        examinerProfileId,
        medicalLicenseDocumentIds: allDocumentIds,
      });

      if (result.success) {
        // Update initial files hash
        const currentHash = JSON.stringify(
          allFiles.map((f) =>
            f instanceof File ? f.name : (f as ExistingDocument).id,
          ),
        );
        initialFilesHashRef.current = currentHash;
        previousFilesRef.current = currentHash;

        toast.success("Documents uploaded and marked as complete");
        if (onMarkComplete) {
          onMarkComplete();
        }
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

  return {
    handleSubmit,
    handleMarkComplete,
    handleFileChange,
    loading,
    isFormValid,
  };
}
