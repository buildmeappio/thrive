import ExaminerProfileDetail from '@/domains/examiner/components/ExaminerProfileDetail';
import { getExaminerProfileById } from '@/domains/examiner/actions';
import { notFound } from 'next/navigation';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    logger.log('Fetching examiner profile with ID:', id);
    const profile = await getExaminerProfileById(id);
    logger.log('Successfully fetched examiner profile:', profile?.id);
    return <ExaminerProfileDetail profile={profile} />;
  } catch (error) {
    logger.error('Error in examiner profile detail page:', error);

    // Only return notFound for 404 errors, re-throw others
    if (error instanceof HttpError && error.status === 404) {
      return notFound();
    }

    // For other errors, throw them to show error page
    throw error;
  }
};

export default Page;
