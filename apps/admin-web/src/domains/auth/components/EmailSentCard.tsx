'use client';

import Link from 'next/link';
import { URLS } from '@/constants/route';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import authActions from '@/domains/auth/actions';
import { toast } from 'sonner';
import logger from '@/utils/logger';

type EmailSentCardProps = {
  email: string;
};

const EmailSentCard = ({ email }: EmailSentCardProps) => {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email || email === 'your email') {
      toast.error('No email address found. Please try again.');
      window.location.href = URLS.PASSWORD_FORGOT;
      return;
    }

    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append('email', email);

      const result = await authActions.forgotPassword(formData);

      if (result.success) {
        toast.success('Reset link sent! Check your inbox.');
      } else {
        toast.error('Failed to resend. Please try again.');
      }
    } catch (error) {
      logger.error('Error resending email:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="shadow-xs rounded-2xl border border-[#E9EDEE] bg-white p-5 text-center sm:rounded-3xl sm:p-8 md:p-10 lg:p-12">
      {/* Email Icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00A8FF]/10 to-[#01F4C8]/10 sm:mb-6 sm:h-20 sm:w-20">
        <Mail className="h-8 w-8 text-[#00A8FF] sm:h-10 sm:w-10" strokeWidth={2} />
      </div>

      {/* Title */}
      <h2 className="mb-3 text-2xl font-semibold sm:mb-4 sm:text-[28px] md:text-[30px] lg:text-[32px]">
        Email Sent!
      </h2>

      {/* Description */}
      <p className="mb-2 text-sm leading-relaxed text-[#4A5568] sm:text-base">
        Check your inbox for password reset instructions.
      </p>
      <p className="mb-6 px-2 text-xs text-[#718096] sm:mb-8 sm:text-sm">
        We sent an email to <span className="break-all font-medium text-[#2D3748]">{email}</span>
      </p>

      {/* Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleResendEmail}
          disabled={isResending}
          className="h-11 w-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-sm font-medium text-white hover:opacity-90 sm:h-12 sm:text-[15px]"
        >
          {isResending ? 'Resending...' : 'Resend Email'}
        </Button>

        <Link href={URLS.LOGIN} className="block">
          <Button
            variant="outline"
            className="h-11 w-full border-2 border-[#00A8FF] text-sm font-medium text-[#00A8FF] hover:bg-[#00A8FF]/5 sm:h-12 sm:text-[15px]"
          >
            ← Back to Login
          </Button>
        </Link>
      </div>

      {/* Footer Note */}
      <p className="mt-6 px-2 text-xs leading-relaxed text-[#718096] sm:mt-8 sm:text-sm">
        Didn&apos;t receive the email? Check your spam folder or try resending.
      </p>
    </div>
  );
};

export default EmailSentCard;
