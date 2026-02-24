import { Suspense } from 'react';
import SuccessPageContent from '@/domains/auth/components/SuccessPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Success | Thrive Examiner',
  description: 'Your account has been created successfully',
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default Page;
