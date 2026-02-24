import { RegisterForm } from '@/domains/auth';
import authActions from '@/domains/auth/actions/index';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ExaminerProfileDetailsData } from '@/types/components';
import { YearsOfExperience } from '@/domains/auth/types';

export const metadata: Metadata = {
  title: 'Register | Thrive Examiner',
  description: 'Register to your account',
};

export const dynamic = 'force-dynamic';

const Page = async ({ searchParams }: { searchParams: Promise<{ token?: string }> }) => {
  const { token } = await searchParams;

  // Fetch years of experience with error handling
  let yearsOfExperience: YearsOfExperience[] = [];
  try {
    yearsOfExperience = await authActions.getYearsOfExperience();
  } catch (error) {
    console.error('Failed to load years of experience:', error);
    // If it's a database error, we'll let it propagate to error.tsx
    // Otherwise, continue with empty array
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDatabaseError =
      errorMessage.toLowerCase().includes('database connection') ||
      errorMessage.toLowerCase().includes('denied access') ||
      errorMessage.toLowerCase().includes('permission denied');

    if (isDatabaseError) {
      // Re-throw database errors so they're handled by error.tsx
      throw error;
    }
    // For other errors, continue with empty array
    console.warn('Continuing with empty years of experience array');
  }

  // If token exists, fetch examiner data and pass to RegisterForm
  let examinerData: ExaminerProfileDetailsData | undefined = undefined;
  if (token) {
    try {
      const result = await authActions.getExaminerProfileDetails(token);
      examinerData = result.data;
    } catch (error) {
      console.error('Failed to load examiner data:', error);
      // Redirect to error page or show error message
      redirect('/register?error=invalid_token');
    }
  }

  return <RegisterForm yearsOfExperience={yearsOfExperience} examinerData={examinerData} />;
};

export default Page;
