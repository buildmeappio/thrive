'use server';

import { z } from 'zod';
import { restoreEmailTemplateVersion } from '../server/emailTemplates.service';

const schema = z.object({
  templateId: z.string().uuid(),
  versionId: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export type RestoreEmailTemplateVersionInput = z.infer<typeof schema>;

export default async function restoreEmailTemplateVersionAction(
  raw: RestoreEmailTemplateVersionInput
) {
  const input = schema.parse(raw);
  return restoreEmailTemplateVersion(input);
}
