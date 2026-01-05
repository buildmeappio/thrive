"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  syncFromGoogleDocsAction,
  getGoogleDocUrlAction,
} from "../../../actions";
import type { UseGoogleDocsSyncReturn } from "../../../types/hooks.types";
import type { EditorRef } from "../../../types/contractTemplateEdit.types";

type UseGoogleDocsSyncParams = {
  templateId: string;
  editorRef: EditorRef;
  setContent: (content: string) => void;
};

export function useGoogleDocsSync({
  templateId,
  editorRef,
  setContent,
}: UseGoogleDocsSyncParams): UseGoogleDocsSyncReturn {
  const [googleDocUrl, setGoogleDocUrl] = useState<string | null>(null);
  const [isLoadingGoogleDocUrl, setIsLoadingGoogleDocUrl] = useState(false);
  const [isSyncingFromGDocs, setIsSyncingFromGDocs] = useState(false);
  const [showSyncConfirmDialog, setShowSyncConfirmDialog] = useState(false);

  // Load Google Doc URL on mount
  useEffect(() => {
    const loadGoogleDocUrl = async () => {
      setIsLoadingGoogleDocUrl(true);
      try {
        const result = await getGoogleDocUrlAction({ templateId });
        if ("error" in result) {
          return;
        }
        if (result.data?.url) {
          setGoogleDocUrl(result.data.url);
        }
      } catch (error) {
        console.error("Error loading Google Doc URL:", error);
      } finally {
        setIsLoadingGoogleDocUrl(false);
      }
    };
    loadGoogleDocUrl();
  }, [templateId]);

  const handleSyncFromGoogleDocsClick = useCallback(() => {
    if (!googleDocUrl) {
      toast.error(
        "No Google Doc linked to this template. Save the template first to create a Google Doc.",
      );
      return;
    }
    setShowSyncConfirmDialog(true);
  }, [googleDocUrl]);

  const handleConfirmSyncFromGoogleDocs = useCallback(async () => {
    // Keep modal open and show loading state inside it
    setIsSyncingFromGDocs(true);
    try {
      const result = await syncFromGoogleDocsAction({ templateId });

      if ("error" in result) {
        toast.error(result.error ?? "Failed to sync from Google Docs");
        setShowSyncConfirmDialog(false);
        return;
      }

      if (result.data) {
        // Update the editor content directly without page refresh
        setContent(result.data.content);

        // Force update the editor if it has a ref
        if (editorRef.current) {
          (editorRef.current as any).commands.setContent(result.data.content);
        }

        toast.success("Content synced from Google Docs successfully");
        // Close modal on success
        setShowSyncConfirmDialog(false);
      }
    } catch (error) {
      console.error("Error syncing from Google Docs:", error);
      toast.error("Failed to sync from Google Docs");
      setShowSyncConfirmDialog(false);
    } finally {
      setIsSyncingFromGDocs(false);
    }
  }, [templateId, editorRef, setContent]);

  return {
    googleDocUrl,
    isLoadingGoogleDocUrl,
    isSyncingFromGDocs,
    showSyncConfirmDialog,
    setGoogleDocUrl,
    setShowSyncConfirmDialog,
    handleSyncFromGoogleDocsClick,
    handleConfirmSyncFromGoogleDocs,
  };
}
