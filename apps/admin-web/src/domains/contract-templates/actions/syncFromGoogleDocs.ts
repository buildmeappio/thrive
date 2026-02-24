'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { syncFromGoogleDoc, getTemplateGoogleDocUrl } from '../server/contractTemplate.service';
import { ActionResult } from '../types/contractTemplate.types';

export type SyncFromGoogleDocsInput = {
  templateId: string;
};

export const syncFromGoogleDocsAction = async (
  input: SyncFromGoogleDocsInput
): Promise<ActionResult<{ id: string; content: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!input.templateId) {
      return { success: false, error: 'Template ID is required' };
    }

    // Sync from Google Docs
    const data = await syncFromGoogleDoc(input.templateId, user.id);

    revalidatePath(`/dashboard/contract-templates/${input.templateId}`);

    return { success: true, data };
  } catch (error) {
    console.error('Error syncing from Google Docs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync from Google Docs',
    };
  }
};

export type GetGoogleDocUrlInput = {
  templateId: string;
};

export const getGoogleDocUrlAction = async (
  input: GetGoogleDocUrlInput
): Promise<ActionResult<{ url: string | null; documentId: string | null }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!input.templateId) {
      return { success: false, error: 'Template ID is required' };
    }

    const data = await getTemplateGoogleDocUrl(input.templateId);

    return { success: true, data };
  } catch (error) {
    console.error('Error getting Google Doc URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Google Doc URL',
    };
  }
};
