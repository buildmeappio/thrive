import ExaminerDetail from '@/domains/examiner/components/ExaminerDetail';
import { getApplicationById } from '@/domains/examiner/actions';
import { notFound } from 'next/navigation';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    logger.log('Fetching application with ID:', id);
    const application = await getApplicationById(id);

    const { status, ...data } = application;
    if (!data || status === 'DRAFT') {
      return notFound();
    }

    logger.log('Successfully fetched application:', data.id);
    return <ExaminerDetail examiner={{ ...data, status }} isApplication={true} />;
  } catch (error) {
    logger.error('Error in application detail page:', error);

    // Only return notFound for 404 errors, re-throw others
    if (error instanceof HttpError && error.status === 404) {
      return notFound();
    }

    // For other errors, throw them to show error page
    throw error;
  }
};

export default Page;
