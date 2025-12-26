"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import { saveTemplateDraftContent } from "../server/contractTemplate.service";
import { ActionResult } from "../types/contractTemplate.types";

export type SyncToGoogleDocsInput = {
  templateId: string;
  content: string;
};

export const syncToGoogleDocsAction = async (
  input: SyncToGoogleDocsInput,
): Promise<ActionResult<{ id: string; googleDocId?: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!input.templateId) {
      return { success: false, error: "Template ID is required" };
    }

    if (!input.content) {
      return { success: false, error: "Content is required" };
    }

    // Save content and sync to Google Docs
    const data = await saveTemplateDraftContent(
      input.templateId,
      input.content,
      user.id,
      undefined, // googleDocTemplateId - will use existing or create new
      undefined, // googleDocFolderId - will use existing or create new
      true, // syncToGoogleDocs = true
    );

    revalidatePath(`/dashboard/contract-templates/${input.templateId}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error syncing to Google Docs:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sync to Google Docs",
    };
  }
};
