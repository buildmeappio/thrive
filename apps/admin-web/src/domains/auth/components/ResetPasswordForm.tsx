'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/PasswordInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { URLS } from '@/constants/route';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import authActions from '../actions';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import logger from '@/utils/logger';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
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
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const result = await authActions.verifyPasswordResetToken(token);
        if (result.valid) {
          setIsValidToken(true);
        } else {
          setTokenError(result.error || 'Invalid or expired token');
        }
      } catch (error) {
        logger.error('Token verification error:', error);
        setTokenError('Invalid or expired token');
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
        toast.success('Password reset successful! Please log in.');
        setTimeout(() => {
          router.push(URLS.LOGIN);
        }, 1500);
      } else {
        toast.error(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      logger.error('Error resetting password:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#00A8FF]" />
        <p className="text-sm text-[#718096]">Verifying reset link...</p>
      </div>
    );
  }

  if (!isValidToken) {
    const isUsedToken = tokenError?.includes('already been used');

    return (
      <div className="py-4 text-center">
        <div
          className={`mb-4 rounded-lg border p-4 ${
            isUsedToken ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <p
            className={`mb-2 text-sm font-medium ${isUsedToken ? 'text-blue-800' : 'text-red-600'}`}
          >
            {isUsedToken
              ? 'This password reset link has already been used'
              : tokenError || 'This password reset link is invalid or has expired'}
          </p>
          {isUsedToken && (
            <p className="text-xs text-blue-700">
              Your password has already been reset successfully.
            </p>
          )}
        </div>
        <p className="mb-4 text-sm text-[#718096]">
          {isUsedToken
            ? 'If you need to reset your password again, please request a new reset link.'
            : 'Password reset links expire after 1 hour for security reasons.'}
        </p>
        <div className="space-y-3">
          {isUsedToken ? (
            <>
              <Button
                onClick={() => router.push(URLS.LOGIN)}
                className="h-11 w-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-sm font-medium text-white hover:opacity-90 sm:text-[15px] md:h-12"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => router.push(URLS.PASSWORD_FORGOT)}
                variant="outline"
                className="h-11 w-full border-2 border-[#00A8FF] text-sm font-medium text-[#00A8FF] hover:bg-[#00A8FF]/5 sm:text-[15px] md:h-12"
              >
                Reset Password
              </Button>
            </>
          ) : (
            <Button
              onClick={() => router.push(URLS.PASSWORD_FORGOT)}
              className="h-11 w-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-sm font-medium text-white hover:opacity-90 sm:text-[15px] md:h-12"
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
        <Label htmlFor="password" className="text-xs text-black sm:text-[13px] md:text-sm">
          New Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="password"
          placeholder="Enter new password"
          disabled={isSubmitting}
          className={`h-11 border-none bg-[#F2F5F6] text-sm placeholder:text-sm placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px] sm:placeholder:text-[15px] md:h-12 ${errors.password ? 'ring-1 ring-red-500' : ''}`}
          {...register('password')}
        />
        <p className="mt-1 min-h-[16px] text-xs text-red-500">{errors.password?.message}</p>
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-xs text-black sm:text-[13px] md:text-sm">
          Confirm Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm new password"
          disabled={isSubmitting}
          className={`h-11 border-none bg-[#F2F5F6] text-sm placeholder:text-sm placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px] sm:placeholder:text-[15px] md:h-12 ${errors.confirmPassword ? 'ring-1 ring-red-500' : ''}`}
          {...register('confirmPassword')}
        />
        <p className="mt-1 min-h-[16px] text-xs text-red-500">{errors.confirmPassword?.message}</p>
      </div>

      <Button
        type="submit"
        variant="default"
        size="default"
        disabled={isSubmitting}
        className="h-11 w-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-sm font-medium text-white hover:opacity-90 sm:text-[15px] md:h-12"
      >
        {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
