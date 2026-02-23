'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import { resetPasswordInitialValues, resetPasswordSchema } from '../../schemas/forget-password';
import { resetPassword, verifyResetToken } from '../../actions';
import { URLS } from '@/constants/routes';
import useRouter from '@/hooks/useRouter';
import log from '@/utils/log';

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordContent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordInitialValues,
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const verifyToken = async () => {
    try {
      const token = searchParams.get('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await verifyResetToken(token);
      if (!response.success) {
        throw new Error(response.error);
      }

      setIsValidToken(true);
      setToken(token);
    } catch (error) {
      log.error(error);
      setIsValidToken(false);
      let message = ErrorMessages.ERROR_VERIFYING_TOKEN as string;
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await resetPassword(token, data.password);

      if (response.success) {
        toast.success(SuccessMessages.PASSWORD_RESET_SUCCESS);
        setTimeout(() => {
          router.push(URLS.LOGIN);
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      let message = ErrorMessages.ERROR_RESETTING_PASSWORD as string;
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="flex h-[calc(100vh-17vh)] items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="flex h-[calc(100vh-17vh)] items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Unauthorized Access</h2>
          <p className="mb-6 text-gray-600">
            You are not authorized to access this page. This reset link is invalid or has expired.
          </p>
          <Button onClick={() => router.push(URLS.PASSWORD_FORGOT)} className="w-full">
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className="flex h-[calc(100vh-17vh)] items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-center text-2xl font-semibold">Reset Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-black">
              New Password<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              {/* <Lock className="absolute top-4 left-3 h-5 w-5" /> */}
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="pr-10 pl-4"
                {...register('password')}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-4 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-black">
              Confirm Password<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="pr-10 pl-4"
                {...register('confirmPassword')}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-4 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            variant="organizationLogin"
            size="organizationLogin"
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                Resetting...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

const ResetPassword = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-17vh)] items-center justify-center bg-gray-50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPassword;
