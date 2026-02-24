'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { saveTemplateDraftContent } from '../server/contractTemplate.service';
import { saveTemplateDraftContentSchema } from '../schemas/contractTemplate.schema';
import { ActionResult, SaveTemplateDraftContentInput } from '../types/contractTemplate.types';

export const saveTemplateDraftContentAction = async (
  input: SaveTemplateDraftContentInput
): Promise<ActionResult<{ id: string; googleDocId?: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = saveTemplateDraftContentSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors[key] = value[0];
        }
      }
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors,
      };
    }

    const data = await saveTemplateDraftContent(
      parsed.data.templateId,
      parsed.data.content,
      user.id,
      parsed.data.googleDocTemplateId,
      parsed.data.googleDocFolderId,
      parsed.data.headerConfig,
      parsed.data.footerConfig
    );

    revalidatePath(`/dashboard/contract-templates/${parsed.data.templateId}`);

    return { success: true, data };
  } catch (error) {
    console.error('Error saving template draft content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save template draft content',
    };
  }
};
