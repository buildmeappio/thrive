'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import handlers from '../server/handlers';
import { redirect } from 'next/navigation';

const updateReportContent = async (
  id: string,
  data: {
    referralQuestionsResponse?: string;
    dynamicSections?: Array<{
      id?: string;
      title: string;
      content: string;
      order: number;
    }>;
  }
) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const reportDetails = await handlers.updateReportContent(id, data);
  return reportDetails;
};

export default updateReportContent;
