import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { URLS } from '@/constants/route';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
              <FileQuestion className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-poppins text-3xl font-bold text-gray-900">Page Not Found</h1>

          {/* Description */}
          <p className="text-base text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Please check the
            URL and try again.
          </p>

          {/* Action Button */}
          <div className="pt-4">
            <Link
              href={URLS.DASHBOARD}
              className="inline-block w-full rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Return to Dashboard
            </Link>
          </div>

          {/* Secondary Action */}
          <div>
            <Link href={URLS.HOME} className="text-sm text-gray-600 underline hover:text-gray-900">
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
