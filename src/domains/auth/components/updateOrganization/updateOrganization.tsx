'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dropdown } from '@/components/Dropdown';
import { useState, useMemo } from 'react';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import {
  updateOrganizationInitialValues,
  updateOrganizationSchema,
} from '../../schemas/updateOrganization';
import { updateOrganizationInfo } from '../../actions';
import { useSession } from 'next-auth/react';
import PhoneInput from '@/components/PhoneNumber';

type UpdateOrganizationInfoForm = z.infer<typeof updateOrganizationSchema>;

export interface OrganizationTypeOption {
  value: string;
  label: string;
}

export interface UpdateOrganizationInfoProps {
  organizationTypes: OrganizationTypeOption[];
  accountInfo: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    managers: Array<{
      organization: {
        id?: string;
        name: string;
        website: string | null;
        type?: { id?: string; name: string } | null;
      };
    }>;
  };
}

const UpdateOrganizationInfo = ({
  organizationTypes: organizationTypeOptions,
  accountInfo,
}: UpdateOrganizationInfoProps) => {
  console.log('account info', accountInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const normalize = (str: string) =>
    str.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_');

  // Fully type-safe defaultValues computation
  const defaultValues = useMemo(() => {
    if (!accountInfo || organizationTypeOptions.length === 0) {
      return updateOrganizationInitialValues;
    }

    const manager = accountInfo.managers?.[0];
    const organization = manager?.organization;
    const user = accountInfo.user;

    if (!organization || !user) {
      return updateOrganizationInitialValues;
    }

    let organizationTypeId = '';

    const orgType = organization.type;
    if (orgType) {
      // Safe access to id
      if (orgType.id) {
        const found = organizationTypeOptions.find(opt => opt.value === orgType.id);
        if (found) organizationTypeId = found.value;
      }

      // Safe fallback to name
      if (!organizationTypeId && typeof orgType.name === 'string') {
        const target = normalize(orgType.name);
        const match = organizationTypeOptions.find(opt => {
          return normalize(opt.label) === target || normalize(opt.value) === target;
        });
        if (match) organizationTypeId = match.value;
      }
    }

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      organizationName: organization.name || '',
      website: organization.website || '',
      organizationTypeId,
    };
  }, [accountInfo, organizationTypeOptions]);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const form = useForm<UpdateOrganizationInfoForm>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues,
    mode: 'onBlur', // Changed to onBlur to prevent validation on every keystroke initially
  });

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    control,
    trigger,
  } = form;

  const onSubmit = async (values: UpdateOrganizationInfoForm) => {
    setAttemptedSubmit(true);
    setIsSubmitting(true);

    try {
      const dataToUpdate = Object.entries(values).reduce((acc, [key, value]) => {
        if (value && value !== '') {
          acc[key as keyof UpdateOrganizationInfoForm] = value;
        }
        return acc;
      }, {} as Partial<UpdateOrganizationInfoForm>);

      if (Object.keys(dataToUpdate).length === 0) {
        toast.error('Please fill at least one field to update');
        setIsSubmitting(false);
        return;
      }

      if (!session?.user?.accountId) {
        toast.error(ErrorMessages.UNAUTHORIZED);
        setIsSubmitting(false);
        return;
      }

      const result = await updateOrganizationInfo(session.user.accountId, dataToUpdate);

      if (result?.success) {
        toast.success(SuccessMessages.ORGANIZATION_INFO_UPDATED);
      } else {
        toast.error(result.error || ErrorMessages.ORGANIZATION_INFO_UPDATE_FAILED);
      }
    } catch (error) {
      toast.error(ErrorMessages.ORGANIZATION_INFO_UPDATE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine if error should be shown
  const shouldShowError = (fieldName: keyof UpdateOrganizationInfoForm) => {
    return attemptedSubmit || !!touchedFields[fieldName];
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Official Information Section */}
      <div className="confirmNewPassword rounded-lg bg-white">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label
              htmlFor="firstName"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              First Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              {...register('firstName', {
                onChange: async () => {
                  if (attemptedSubmit) {
                    await trigger('firstName');
                  }
                },
              })}
              disabled={isSubmitting}
            />
            {shouldShowError('firstName') && errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="lastName"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Last Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              {...register('lastName', {
                onChange: async () => {
                  if (attemptedSubmit) {
                    await trigger('lastName');
                  }
                },
              })}
              disabled={isSubmitting}
            />
            {shouldShowError('lastName') && errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label
              htmlFor="email"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              disabled={true}
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
            />
            {shouldShowError('email') && errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Phone<span className="text-red-500">*</span>
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  name={field.name}
                  value={field.value || ''}
                  onChange={async e => {
                    field.onChange(e);
                    if (attemptedSubmit) {
                      await trigger('phone');
                    }
                  }}
                  onBlur={field.onBlur}
                  disabled={isSubmitting}
                />
              )}
            />
            {shouldShowError('phone') && errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Organization Information Section */}
      <div className="confirmNewPassword rounded-lg bg-white">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label
              htmlFor="organizationName"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Organization Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="organizationName"
              placeholder="Enter organization name"
              {...register('organizationName', {
                onChange: async () => {
                  if (attemptedSubmit) {
                    await trigger('organizationName');
                  }
                },
              })}
              disabled={isSubmitting}
            />
            {shouldShowError('organizationName') && errors.organizationName && (
              <p className="mt-1 text-xs text-red-500">{errors.organizationName.message}</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="website"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://desjardins.com"
              {...register('website')}
              disabled={isSubmitting}
            />
            {touchedFields.website && errors.website && (
              <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Label
            htmlFor="organizationTypeId"
            className="font-poppins text-[14.78px] leading-[150%] font-normal tracking-[0em]"
          >
            Organization Type<span className="text-red-500">*</span>
          </Label>
          <Controller
            name="organizationTypeId"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="organizationTypeId"
                label=""
                value={field.value || ''}
                onChange={async value => {
                  field.onChange(value);
                  if (attemptedSubmit) {
                    await trigger('organizationTypeId');
                  }
                }}
                options={organizationTypeOptions}
                required={true}
                placeholder="Select Organization Type"
              />
            )}
          />
          {shouldShowError('organizationTypeId') && errors.organizationTypeId && (
            <p className="mt-1 text-xs text-red-500">{errors.organizationTypeId.message}</p>
          )}
        </div>
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

export default UpdateOrganizationInfo;
