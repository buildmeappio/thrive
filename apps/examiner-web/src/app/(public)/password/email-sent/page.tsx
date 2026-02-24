'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import forgotPassword from '@/domains/auth/actions/forgotPassword';

const EmailSentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setIsResending(true);
    try {
      const result = await forgotPassword({ email });
      if (result.success) {
        toast.success('Email sent successfully!');
      } else {
        toast.error(result.message || 'Failed to resend email');
      }
    } catch {
      toast.error('Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden bg-[#F4FBFF]">
      <div className="flex h-full items-center justify-center px-6">
        <div className="w-full max-w-[500px]">
          {/* Card Container */}
          <div
            className="rounded-[20px] bg-white px-6 py-8 text-center md:px-12 md:py-12"
            style={{
              boxShadow: '0px 0px 36.35px 0px #00000008',
            }}
          >
            {/* Email Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F7FF]">
                <Mail className="h-8 w-8 text-[#00A8FF]" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="mb-3 text-2xl font-semibold text-gray-900">Email Sent!</h1>

            {/* Description */}
            <p className="mb-2 text-sm text-gray-600">
              Check your inbox for password reset instructions.
            </p>
            {email && (
              <p className="mb-6 text-sm text-gray-500">
                We sent an email to <span className="font-medium">{email}</span>
              </p>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={isResending}
                className="h-11 w-full rounded-full bg-[#00A8FF] font-semibold text-white hover:bg-[#0096E6]"
              >
                {isResending ? 'Resending...' : 'Resend Email'}
              </Button>

              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-[#00A8FF] font-semibold text-[#00A8FF] hover:bg-[#E6F7FF]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </div>

            {/* Help Text */}
            <p className="mt-4 text-xs text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailSentPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-120px)] items-center justify-center bg-[#F4FBFF]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent"></div>
        </div>
      }
    >
      <EmailSentContent />
    </Suspense>
  );
};

export default EmailSentPage;
