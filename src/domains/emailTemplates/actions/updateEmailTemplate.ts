"use server";

import { z } from "zod";
import { updateEmailTemplate } from "../server/emailTemplates.service";

const schema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1, "Subject is required").max(500),
  bodyHtml: z.string().min(1, "Body HTML is required"),
  designJson: z.unknown(),
  isActive: z.boolean().optional(),
});

export type UpdateEmailTemplateInput = z.infer<typeof schema>;

export default async function updateEmailTemplateAction(
  raw: UpdateEmailTemplateInput,
) {
  const input = schema.parse(raw);
  return updateEmailTemplate(input);
}
