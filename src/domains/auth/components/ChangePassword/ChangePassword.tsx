'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/PasswordInput';
import { ArrowRight, Loader2 } from 'lucide-react';
import useRouter from '@/hooks/useRouter';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { URLS } from '@/constants/routes';
import { changePasswordInitialValues, changePasswordSchema } from '../../schemas/change-password';
import { useSession } from 'next-auth/react';
import { changePassword } from '../../actions';

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: changePasswordInitialValues,
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    trigger,
    watch,
  } = form;

  // Watch newPassword field to trigger validation on confirmNewPassword
  const newPassword = watch('newPassword');

  useEffect(() => {
    // Re-validate confirmNewPassword when newPassword changes (if confirmNewPassword was touched)
    if (touchedFields.confirmNewPassword && newPassword) {
      trigger('confirmNewPassword');
    }
  }, [newPassword, trigger, touchedFields.confirmNewPassword]);

  const onSubmit = async (values: ChangePasswordForm) => {
    setIsSubmitting(true);

    try {
      if (!session?.user?.email) {
        toast.error(ErrorMessages.UNAUTHORIZED);
        setIsSubmitting(false);
        return;
      }
      const result = await changePassword(
        session.user.email,
        values.oldPassword,
        values.newPassword
      );

      if (result?.success) {
        toast.success(SuccessMessages.PASSWORD_CHANGED_SUCCESS);
      } else {
        toast.error(result.error || ErrorMessages.PASSWORD_CHANGE_FAILED);
      }
    } catch (error) {
      toast.error(ErrorMessages.PASSWORD_CHANGE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Old Password Field */}
      <div className="mb-6">
        <Label
          htmlFor="oldPassword"
          className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
        >
          Old Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="oldPassword"
          placeholder="Enter old password"
          {...register('oldPassword')}
          disabled={isSubmitting}
        />
        {touchedFields.oldPassword && errors.oldPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.oldPassword.message}</p>
        )}
      </div>

      <div className="mb-6">
        <Label
          htmlFor="newPassword"
          className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
        >
          New Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="newPassword"
          placeholder="Enter new password"
          {...register('newPassword')}
          disabled={isSubmitting}
        />
        {touchedFields.newPassword && errors.newPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="mb-6">
        <Label
          htmlFor="confirmNewPassword"
          className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
        >
          Confirm Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="confirmNewPassword"
          placeholder="Enter confirm password"
          {...register('confirmNewPassword')}
          disabled={isSubmitting}
        />
        {touchedFields.confirmNewPassword && errors.confirmNewPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <Button
        className="h-[45px] max-w-[200px]"
        variant="organizationLogin"
        size="organizationLogin"
        type="submit"
        disabled={isSubmitting}
      >
        Update
        <span>
          {isSubmitting ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
          ) : (
            <ArrowRight className="cup ml-2 h-4 w-8 text-white transition-all duration-300 ease-in-out" />
          )}
        </span>
      </Button>
    </form>
  );
};

export default ChangePassword;
