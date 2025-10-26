import { type Metadata } from 'next';
import { CheckCircle, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Availability Status',
  description: 'View your availability submission status.',
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string }>;
}) => {
  const { status, message } = await searchParams;
  const isError = status === 'error';

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 px-4 py-20 text-center md:py-40">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-md">
        {isError ? (
          <XCircle className="mx-auto h-16 w-16 text-red-600" />
        ) : (
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        )}
        <h1 className={`mt-6 text-2xl font-bold ${isError ? 'text-red-900' : 'text-gray-900'}`}>
          {isError ? 'Access Error' : 'Availability Submitted'}
        </h1>
        <p className={`mt-4 ${isError ? 'text-red-600' : 'text-gray-600'}`}>
          {isError
            ? message ||
              'There was an error accessing your availability portal. Please check your link or contact support.'
            : "Your availability has been successfully submitted. We'll notify you if any updates are required."}
        </p>
      </div>
    </div>
  );
};

export default Page;
