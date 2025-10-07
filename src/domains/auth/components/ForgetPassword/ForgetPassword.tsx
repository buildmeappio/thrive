'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import { forgetPasswordInitialValues, forgetPasswordSchema } from '../../schemas/forget-password';
import { sendResetPasswordLink } from '../../actions';

type ForgetPasswordForm = z.infer<typeof forgetPasswordSchema>;

const ForgetPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        toast.error(ErrorMessages.ERROR_SENDING_RESET_LINK);
      }
      toast.success(SuccessMessages.PASSWORD_RESET_LINK_SENT);
    } catch (error) {
      console.error(ErrorMessages.ERROR_SENDING_RESET_LINK, error);
      toast.error(ErrorMessages.ERROR_SENDING_RESET_LINK);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-center text-2xl font-semibold">Forgot Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-black">
              Email<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register('email')}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Sending...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordForm;
