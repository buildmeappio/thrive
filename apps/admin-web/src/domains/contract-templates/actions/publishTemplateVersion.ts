'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { publishTemplateVersion } from '../server/contractTemplate.service';
import { publishTemplateVersionSchema } from '../schemas/contractTemplate.schema';
import { ActionResult, PublishTemplateVersionInput } from '../types/contractTemplate.types';

export const publishTemplateVersionAction = async (
  input: PublishTemplateVersionInput
): Promise<ActionResult<{ id: string; version: number }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = publishTemplateVersionSchema.safeParse(input);
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

    const data = await publishTemplateVersion(parsed.data.templateId, parsed.data.changeNotes);

    revalidatePath('/dashboard/contract-templates');
    revalidatePath(`/dashboard/contract-templates/${parsed.data.templateId}`);
    // Revalidate all examiner pages that might use contract templates
    revalidatePath('/dashboard/examiners', 'page');
    revalidatePath('/dashboard/examiners', 'layout');

    return { success: true, data };
  } catch (error) {
    console.error('Error publishing template version:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish template version',
    };
  }
};
