'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import { forgetPasswordInitialValues, forgetPasswordSchema } from '../../schemas/forget-password';
import { sendResetPasswordLink } from '../../actions';

type ForgetPasswordForm = z.infer<typeof forgetPasswordSchema>;

const ForgetPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false); // Track success state
  const [emailSentTo, setEmailSentTo] = useState(''); // Optional: show which email

  const form = useForm<ForgetPasswordForm>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: forgetPasswordInitialValues,
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ForgetPasswordForm) => {
    setIsSubmitting(true);
    try {
      const response = await sendResetPasswordLink(data.email);
      if (!response.success) {
        throw new Error(response.error);
      }

      // Success! Show success UI instead of just toast
      setIsSent(true);
      setEmailSentTo(data.email);
      toast.success(SuccessMessages.PASSWORD_RESET_LINK_SENT);
    } catch (error) {
      let message = ErrorMessages.ERROR_SENDING_RESET_LINK as string;
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If email was sent, show success message
  if (isSent) {
    return (
      <div className="flex h-[calc(100vh-17vh)] flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" />
          <h2 className="mb-3 text-2xl font-semibold">Check your inbox</h2>
          <p className="mb-2 text-gray-600">We’ve sent a password reset link to</p>
          <p className="font-medium text-black">{emailSentTo}</p>

          <div className="mt-8 text-sm text-gray-500">
            <p>Didn&apos;t receive the email?</p>
            <p>
              Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSent(false);
                  form.reset();
                }}
                className="font-medium text-blue-600 hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default form view
  return (
    <div className="flex h-[calc(100vh-17vh)] flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <div className="mb-6 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="text-2xl font-semibold">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-black">
              Email<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                disabled={isSubmitting}
                className="pl-10"
              />
              <Mail className="absolute top-5 left-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            variant="organizationLogin"
            size="organizationLogin"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                Sending
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:underline">
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgetPasswordForm;
