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
import { useState, useEffect } from 'react';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import {
  updateOrganizationInitialValues,
  updateOrganizationSchema,
} from '../../schemas/updateOrganization';
import { updateOrganizationInfo } from '../../actions';
import { useSession } from 'next-auth/react';
import { getOrganizationTypes } from '@/domains/organization/actions';
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

  const form = useForm<UpdateOrganizationInfoForm>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: updateOrganizationInitialValues,
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    control,
  } = form;

  // Fetch initial data and populate form
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!accountInfo) {
          toast.error('Failed to load organization information');
          return;
        }

        // Extract organization data from the nested structure
        const manager = accountInfo.managers?.[0];
        const organization = manager?.organization;
        const user = accountInfo.user;

        // Find the organization type ID from organizationTypeOptions
        const organizationTypeName = organization?.type?.name;
        const matchingOrgType = organizationTypeOptions.find(
          option => option.label === organizationTypeName || option.value === organizationTypeName
        );

        const orgInfo = {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          organizationName: organization?.name || '',
          website: organization?.website || '',
          organizationTypeId: matchingOrgType?.value || '',
        };

        console.log('Populating form with:', orgInfo);
        reset(orgInfo);
      } catch (error) {
        console.error('Error loading organization info:', error);
        toast.error('Failed to load organization information');
      }
    };

    fetchData();
  }, [accountInfo, organizationTypeOptions, reset]);

  const onSubmit = async (values: UpdateOrganizationInfoForm) => {
    setIsSubmitting(true);

    try {
      // Filter out empty strings and undefined values
      const dataToUpdate = Object.entries(values).reduce((acc, [key, value]) => {
        if (value && value !== '') {
          acc[key as keyof UpdateOrganizationInfoForm] = value;
        }
        return acc;
      }, {} as Partial<UpdateOrganizationInfoForm>);

      // Check if there's anything to update
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Official Information Section */}
      <div className="confirmNewPassword rounded-lg bg-white">
        <h3 className="mb-4 text-lg font-semibold">Official Information</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* First Name Field */}
          <div>
            <Label
              htmlFor="firstName"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              {...register('firstName')}
              disabled={isSubmitting}
            />
            {touchedFields.firstName && errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name Field */}
          <div>
            <Label
              htmlFor="lastName"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              {...register('lastName')}
              disabled={isSubmitting}
            />
            {touchedFields.lastName && errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Email Field */}
          <div>
            <Label
              htmlFor="email"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Email
            </Label>
            <Input
              disabled={true}
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
            />
            {touchedFields.email && errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <Label
              htmlFor="phone"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Phone
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  name={field.name}
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={isSubmitting}
                />
              )}
            />
            {touchedFields.phone && errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Organization Information Section */}
      <div className="confirmNewPassword rounded-lg bg-white">
        <h3 className="mb-4 text-lg font-semibold">Organization Information</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Organization Name Field */}
          <div>
            <Label
              htmlFor="organizationName"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Organization Name
            </Label>
            <Input
              id="organizationName"
              placeholder="Enter organization name"
              {...register('organizationName')}
              disabled={isSubmitting}
            />
            {touchedFields.organizationName && errors.organizationName && (
              <p className="mt-1 text-xs text-red-500">{errors.organizationName.message}</p>
            )}
          </div>

          {/* Website Field */}
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

        {/* Organization Type Field */}
        <div className="mt-6">
          <Label
            htmlFor="organizationTypeId"
            className="font-poppins text-[14.78px] leading-[150%] font-normal tracking-[0em]"
          >
            Organization Type
          </Label>
          <Controller
            name="organizationTypeId"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="organizationTypeId"
                label=""
                value={field.value || accountInfo.managers?.[0]?.organization?.type?.name || ''}
                onChange={field.onChange}
                options={organizationTypeOptions}
                required={false}
                placeholder="Select Organization Type"
              />
            )}
          />
          {touchedFields.organizationTypeId && errors.organizationTypeId && (
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
