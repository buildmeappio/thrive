import { notFound } from 'next/navigation';
import EmailTemplateEditPageContent from './EmailTemplateEditPageContent';
import { getEmailTemplateById } from '@/domains/emailTemplates/server/emailTemplates.service';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmailTemplateEditPage({ params }: Props) {
  const { id } = await params;
  try {
    const template = await getEmailTemplateById(id);
    return <EmailTemplateEditPageContent template={template} />;
  } catch {
    notFound();
  }
}
