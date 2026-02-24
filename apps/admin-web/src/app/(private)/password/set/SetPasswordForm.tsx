'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import authActions from '@/domains/auth/actions';
import { signOut } from 'next-auth/react';
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

const SetPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: FormInput) => {
    try {
      const result = await authActions.completeTemporaryPassword({
        password: values.password,
      });

      if (result.success) {
        toast.success('Password set successfully! Please log in with your new password.');

        // Sign out the user and redirect to login page
        setTimeout(() => {
          signOut({ callbackUrl: '/admin/login', redirect: true });
        }, 1500);
      } else {
        toast.error(result.error || 'Failed to set password. Please try again.');
      }
    } catch (error) {
      logger.error('Error setting password:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

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
        {isSubmitting ? 'Setting Password...' : 'Set Password'}
      </Button>
    </form>
  );
};

export default SetPasswordForm;
