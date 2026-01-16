'use client';

import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { URLS } from '@/constants/routes';

interface InvitationErrorProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
}

const InvitationError: React.FC<InvitationErrorProps> = ({
  title = 'Invalid Invitation',
  message = 'Invalid or expired invitation token.',
  showLoginButton = true,
}) => {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] flex-col items-center justify-start px-4 pt-16 pb-6 md:px-0 md:pt-24">
      <div className="w-full max-w-md rounded-[20px] bg-white px-6 py-8 shadow-lg md:rounded-[30px] md:px-12 md:py-12">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 md:mb-8 md:h-24 md:w-24">
            <XCircle className="h-12 w-12 text-red-500 md:h-16 md:w-16" />
          </div>

          {/* Title */}
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">{title}</h2>

          {/* Message */}
          <p className="mb-6 text-base text-gray-600 md:mb-8 md:text-lg">{message}</p>

          {/* Additional Info */}
          <p className="mb-8 text-sm text-gray-500 md:text-base">
            If you have received an invitation email, please click the link in that email to
            complete your registration.
          </p>

          {/* Login Button */}
          {showLoginButton && (
            <Button
              onClick={() => router.push(URLS.LOGIN)}
              className="w-full rounded-full bg-[#140047] px-6 py-3 text-white hover:bg-[#140047]/90 md:px-8 md:py-4"
            >
              Go to Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationError;
