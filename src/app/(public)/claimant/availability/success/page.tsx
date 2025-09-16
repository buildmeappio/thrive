import { type Metadata } from 'next';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Availability Submitted',
  description: 'Your availability has been successfully submitted.',
};

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 px-4 py-20 text-center md:py-40">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-md">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Availability Submitted</h1>
        <p className="mt-4 text-gray-600">
          Your availability has been successfully submitted. We’ll notify you if any updates are
          required.
        </p>
      </div>
    </div>
  );
};

export default Page;
