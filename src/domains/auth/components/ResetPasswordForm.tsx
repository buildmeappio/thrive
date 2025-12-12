"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { URLS } from "@/constants/route";
import * as z from "zod";
import { useRouter } from "next/navigation";
import authActions from "../actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import logger from "@/utils/logger";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormInput = z.infer<typeof schema>;

type ResetPasswordFormProps = {
  token: string;
};

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const result = await authActions.verifyPasswordResetToken(token);
        if (result.valid) {
          setIsValidToken(true);
        } else {
          setTokenError(result.error || "Invalid or expired token");
        }
      } catch (error) {
        logger.error("Token verification error:", error);
        setTokenError("Invalid or expired token");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (values: FormInput) => {
    try {
      const result = await authActions.resetPassword({
        token,
        password: values.password,
      });

      if (result.success) {
        toast.success("Password reset successful! Please log in.");
        setTimeout(() => {
          router.push(URLS.LOGIN);
        }, 1500);
      } else {
        toast.error(
          result.error || "Failed to reset password. Please try again.",
        );
      }
    } catch (error) {
      logger.error("Error resetting password:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A8FF] mb-4" />
        <p className="text-sm text-[#718096]">Verifying reset link...</p>
      </div>
    );
  }

  if (!isValidToken) {
    const isUsedToken = tokenError?.includes("already been used");

    return (
      <div className="text-center py-4">
        <div
          className={`mb-4 p-4 rounded-lg border ${
            isUsedToken
              ? "bg-blue-50 border-blue-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p
            className={`text-sm font-medium mb-2 ${
              isUsedToken ? "text-blue-800" : "text-red-600"
            }`}
          >
            {isUsedToken
              ? "This password reset link has already been used"
              : tokenError ||
                "This password reset link is invalid or has expired"}
          </p>
          {isUsedToken && (
            <p className="text-xs text-blue-700">
              Your password has already been reset successfully.
            </p>
          )}
        </div>
        <p className="text-sm text-[#718096] mb-4">
          {isUsedToken
            ? "If you need to reset your password again, please request a new reset link."
            : "Password reset links expire after 1 hour for security reasons."}
        </p>
        <div className="space-y-3">
          {isUsedToken ? (
            <>
              <Button
                onClick={() => router.push(URLS.LOGIN)}
                className="w-full h-11 md:h-12 text-sm sm:text-[15px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] hover:opacity-90 text-white font-medium"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => router.push(URLS.PASSWORD_FORGOT)}
                variant="outline"
                className="w-full h-11 md:h-12 border-2 border-[#00A8FF] text-[#00A8FF] hover:bg-[#00A8FF]/5 text-sm sm:text-[15px] font-medium"
              >
                Reset Password
              </Button>
            </>
          ) : (
            <Button
              onClick={() => router.push(URLS.PASSWORD_FORGOT)}
              className="w-full h-11 md:h-12 text-sm sm:text-[15px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] hover:opacity-90 text-white font-medium"
            >
              Request New Reset Link
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
      <div>
        <Label
          htmlFor="password"
          className="text-black text-xs sm:text-[13px] md:text-sm"
        >
          New Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="password"
          placeholder="Enter new password"
          disabled={isSubmitting}
          className={`h-11 md:h-12 text-sm sm:text-[15px] border-none bg-[#F2F5F6]
                      placeholder:text-[#9EA9AA] placeholder:text-sm sm:placeholder:text-[15px]
                      focus-visible:ring-1 focus-visible:ring-offset-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${errors.password ? "ring-1 ring-red-500" : ""}`}
          {...register("password")}
        />
        <p className="min-h-[16px] text-xs text-red-500 mt-1">
          {errors.password?.message}
        </p>
      </div>

      <div>
        <Label
          htmlFor="confirmPassword"
          className="text-black text-xs sm:text-[13px] md:text-sm"
        >
          Confirm Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm new password"
          disabled={isSubmitting}
          className={`h-11 md:h-12 text-sm sm:text-[15px] border-none bg-[#F2F5F6]
                      placeholder:text-[#9EA9AA] placeholder:text-sm sm:placeholder:text-[15px]
                      focus-visible:ring-1 focus-visible:ring-offset-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${errors.confirmPassword ? "ring-1 ring-red-500" : ""}`}
          {...register("confirmPassword")}
        />
        <p className="min-h-[16px] text-xs text-red-500 mt-1">
          {errors.confirmPassword?.message}
        </p>
      </div>

      <Button
        type="submit"
        variant="default"
        size="default"
        disabled={isSubmitting}
        className="w-full h-11 md:h-12 text-sm sm:text-[15px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] hover:opacity-90 text-white font-medium"
      >
        {isSubmitting ? "Resetting Password..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
