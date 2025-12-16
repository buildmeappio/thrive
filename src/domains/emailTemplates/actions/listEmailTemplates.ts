"use server";

import { listEmailTemplates } from "../server/emailTemplates.service";

export default async function listEmailTemplatesAction() {
    return listEmailTemplates();
}


