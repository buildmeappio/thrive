'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormProvider, FormField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/PasswordInput';
import { useForm } from '@/hooks/use-form-hook';
import { UseFormRegisterReturn } from '@/lib/form';
import { toast } from 'sonner';
import { CircleCheck } from 'lucide-react';
import { URLS } from '@/constants/route';
import changePassword from '@/domains/auth/actions/changePassword';
import { passwordSchema, PasswordFormData } from '../schemas/password.schema';
import type { ChangePasswordSectionProps } from '../types';

const ChangePasswordSection: React.FC<ChangePasswordSectionProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordFormData>({
    schema: passwordSchema,
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: PasswordFormData) => {
    setLoading(true);
    try {
      const result = await changePassword({
        userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (result.success) {
        toast.success('Password changed successfully');
        form.reset();
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Change Password</h2>

      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-3 pb-14">
          <div>
            <FormField name="currentPassword" label="Current Password" required>
              {(field: UseFormRegisterReturn & { error?: boolean }) => (
                <PasswordInput
                  {...field}
                  placeholder="Enter current password"
                  className="bg-[#F9F9F9]"
                />
              )}
            </FormField>
            <div className="mt-1 text-right">
              <Link
                href={URLS.PASSWORD_FORGOT}
                className="text-sm font-bold text-[#0097E5] underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <FormField
            name="newPassword"
            label="New Password"
            required
            hint="Must be at least 6 characters with one uppercase letter, one lowercase letter, and one number"
          >
            {(field: UseFormRegisterReturn & { error?: boolean }) => (
              <PasswordInput {...field} placeholder="Enter new password" className="bg-[#F9F9F9]" />
            )}
          </FormField>

          <FormField name="confirmPassword" label="Confirm Password" required>
            {(field: UseFormRegisterReturn & { error?: boolean }) => (
              <PasswordInput
                {...field}
                placeholder="Confirm new password"
                className="bg-[#F9F9F9]"
              />
            )}
          </FormField>
        </div>

        {/* Update Password Button - Bottom Right */}
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="submit"
            disabled={loading}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#00A8FF] px-6 py-2 text-white shadow-lg hover:bg-[#0090d9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
            <CircleCheck className="h-5 w-5 text-white" />
          </Button>
        </div>
      </FormProvider>
    </div>
  );
};

export default ChangePasswordSection;
