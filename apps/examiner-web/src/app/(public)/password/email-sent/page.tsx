"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import forgotPassword from "@/domains/auth/actions/forgotPassword";

const EmailSentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address not found");
      return;
    }

    setIsResending(true);
    try {
      const result = await forgotPassword({ email });
      if (result.success) {
        toast.success("Email sent successfully!");
      } else {
        toast.error(result.message || "Failed to resend email");
      }
    } catch {
      toast.error("Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="bg-[#F4FBFF] h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-[500px] w-full">
          {/* Card Container */}
          <div
            className="rounded-[20px] bg-white px-6 py-8 md:px-12 md:py-12 text-center"
            style={{
              boxShadow: "0px 0px 36.35px 0px #00000008",
            }}
          >
            {/* Email Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#E6F7FF] flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#00A8FF]" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Email Sent!
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-2 text-sm">
              Check your inbox for password reset instructions.
            </p>
            {email && (
              <p className="text-sm text-gray-500 mb-6">
                We sent an email to <span className="font-medium">{email}</span>
              </p>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={isResending}
                className="w-full rounded-full bg-[#00A8FF] hover:bg-[#0096E6] text-white h-11 font-semibold"
              >
                {isResending ? "Resending..." : "Resend Email"}
              </Button>

              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="w-full rounded-full border-2 border-[#00A8FF] text-[#00A8FF] hover:bg-[#E6F7FF] h-11 flex items-center justify-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-4">
              Didn&apos;t receive the email? Check your spam folder or try
              resending.
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
        <div className="bg-[#F4FBFF] h-[calc(100vh-120px)] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent"></div>
        </div>
      }
    >
      <EmailSentContent />
    </Suspense>
  );
};

export default EmailSentPage;
