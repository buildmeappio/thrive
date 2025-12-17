"use client";
import { useState, useEffect, useMemo } from "react";
import { DocumentFile, ExistingDocument } from "@/components/FileUploadInput";
import { getDocumentByIdAction } from "../server/actions";

interface UseDocumentLoadingOptions {
  documentIds?: string[];
}

/**
 * Hook for loading existing documents from database
 */
export function useDocumentLoading({ documentIds }: UseDocumentLoadingOptions) {
  const [allFiles, setAllFiles] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);

  const mergedInitialData = useMemo(() => {
    return {
      documentIds: documentIds || [],
    };
  }, [documentIds]);

  // Load existing documents from mergedInitialData
  useEffect(() => {
    const loadExistingDocuments = async () => {
      const existingDocs: ExistingDocument[] = [];

      // Load all documents from the single documentIds array
      if (mergedInitialData?.documentIds?.length) {
        setLoading(true);
        try {
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
        } catch (error) {
          console.error("Failed to load documents:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

      setAllFiles(existingDocs);
    };

    loadExistingDocuments();
  }, [mergedInitialData]);

  return {
    allFiles,
    setAllFiles,
    loading,
  };
}
