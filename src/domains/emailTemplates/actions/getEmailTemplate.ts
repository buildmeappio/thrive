"use server";

import { getEmailTemplateById } from "../server/emailTemplates.service";

export default async function getEmailTemplateAction(id: string) {
    return getEmailTemplateById(id);
}


