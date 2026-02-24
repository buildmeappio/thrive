import EmailTemplatesPageContent from './EmailTemplatesPageContent';
import { listEmailTemplates } from '@/domains/emailTemplates/server/emailTemplates.service';

export const dynamic = 'force-dynamic';

export default async function EmailTemplatesPage() {
  const templates = await listEmailTemplates();
  return <EmailTemplatesPageContent templates={templates} />;
}
