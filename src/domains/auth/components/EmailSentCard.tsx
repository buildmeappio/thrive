"use client";

import Link from "next/link";
import { URLS } from "@/constants/route";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import authActions from "@/domains/auth/actions";
import { toast } from "sonner";
import logger from "@/utils/logger";

type EmailSentCardProps = {
  email: string;
};

const EmailSentCard = ({ email }: EmailSentCardProps) => {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email || email === "your email") {
      toast.error("No email address found. Please try again.");
      window.location.href = URLS.PASSWORD_FORGOT;
      return;
    }

    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      
      const result = await authActions.forgotPassword(formData);
      
      if (result.success) {
        toast.success("Reset link sent! Check your inbox.");
      } else {
        toast.error("Failed to resend. Please try again.");
      }
    } catch (error) {
      logger.error("Error resending email:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-[#E9EDEE] bg-white p-5 sm:p-8 md:p-10 lg:p-12 shadow-xs text-center">
      {/* Email Icon */}
      <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#00A8FF]/10 to-[#01F4C8]/10">
        <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-[#00A8FF]" strokeWidth={2} />
      </div>

      {/* Title */}
      <h2 className="mb-3 sm:mb-4 font-semibold text-2xl sm:text-[28px] md:text-[30px] lg:text-[32px]">
        Email Sent!
      </h2>

      {/* Description */}
      <p className="mb-2 text-[#4A5568] text-sm sm:text-base leading-relaxed">
        Check your inbox for password reset instructions.
      </p>
      <p className="mb-6 sm:mb-8 text-[#718096] text-xs sm:text-sm px-2">
        We sent an email to{" "}
        <span className="font-medium text-[#2D3748] break-all">{email}</span>
      </p>

      {/* Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleResendEmail}
          disabled={isResending}
          className="w-full h-11 sm:h-12 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] hover:opacity-90 text-white text-sm sm:text-[15px] font-medium"
        >
          {isResending ? "Resending..." : "Resend Email"}
        </Button>

        <Link href={URLS.LOGIN} className="block">
          <Button
            variant="outline"
            className="w-full h-11 sm:h-12 border-2 border-[#00A8FF] text-[#00A8FF] hover:bg-[#00A8FF]/5 text-sm sm:text-[15px] font-medium"
          >
            ← Back to Login
          </Button>
        </Link>
      </div>

      {/* Footer Note */}
      <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-[#718096] leading-relaxed px-2">
        Didn&apos;t receive the email? Check your spam folder or try
        resending.
      </p>
    </div>
  );
};

export default EmailSentCard;
