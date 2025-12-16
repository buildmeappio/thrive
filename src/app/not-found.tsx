import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { URLS } from "@/constants/route";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-base">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Please check the URL and try again.
          </p>

          {/* Action Button */}
          <div className="pt-4">
            <Link
              href={URLS.DASHBOARD}
              className="inline-block w-full px-6 py-3 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </Link>
          </div>

          {/* Secondary Action */}
          <div>
            <Link
              href={URLS.HOME}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
