import EmailTemplatesPageContent from "./EmailTemplatesPageContent";
import { listEmailTemplates } from "@/domains/emailTemplates/server/emailTemplates.service";

export default async function EmailTemplatesPage() {
  const templates = await listEmailTemplates();
  return <EmailTemplatesPageContent templates={templates} />;
}


