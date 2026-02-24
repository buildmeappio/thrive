'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormProvider,
  FormField,
  FormPhoneInput,
  FormDropdown,
  FormGoogleMapsInput,
} from '@/components/form';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { useForm } from '@/hooks/use-form-hook';
import { UseFormRegisterReturn } from '@/lib/form';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateExaminerProfileAction } from '../server/actions';
import { User, Mail, PhoneCall } from 'lucide-react';
import { provinces } from '@/constants/options';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .regex(
      /^[a-zA-Z\s'.-]+$/,
      'First name can only contain letters, spaces, apostrophes, hyphens, and periods'
    )
    .refine(
      val => {
        const trimmed = val.trim();
        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(trimmed)) {
          return false;
        }
        // Cannot start or end with special characters or spaces
        if (/^['-.\s]/.test(trimmed) || /['-.\s]$/.test(trimmed)) {
          return false;
        }
        // Cannot have consecutive special characters
        if (/['-]{2,}/.test(trimmed) || /\.{2,}/.test(trimmed)) {
          return false;
        }
        return true;
      },
      {
        message:
          'First name must contain at least one letter and cannot start/end with special characters',
      }
    ),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .regex(
      /^[a-zA-Z\s'.-]+$/,
      'Last name can only contain letters, spaces, apostrophes, hyphens, and periods'
    )
    .refine(
      val => {
        const trimmed = val.trim();
        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(trimmed)) {
          return false;
        }
        // Cannot start or end with special characters or spaces
        if (/^['-.\s]/.test(trimmed) || /['-.\s]$/.test(trimmed)) {
          return false;
        }
        // Cannot have consecutive special characters
        if (/['-]{2,}/.test(trimmed) || /\.{2,}/.test(trimmed)) {
          return false;
        }
        return true;
      },
      {
        message:
          'Last name must contain at least one letter and cannot start/end with special characters',
      }
    ),
  emailAddress: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  landlineNumber: z.string().optional(),
  provinceOfResidence: z.string().min(1, 'Province is required'),
  mailingAddress: z.string().min(1, 'Mailing address is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileInformationSectionProps {
  examinerProfileId: string;
  initialData: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    landlineNumber?: string;
    provinceOfResidence?: string;
    mailingAddress?: string;
  };
}

const ProfileInformationSection: React.FC<ProfileInformationSectionProps> = ({
  examinerProfileId,
  initialData,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    schema: profileSchema,
    defaultValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      emailAddress: initialData.emailAddress || '',
      phoneNumber: initialData.phoneNumber || '',
      landlineNumber: initialData.landlineNumber || '',
      provinceOfResidence: initialData.provinceOfResidence || '',
      mailingAddress: initialData.mailingAddress || '',
    },
    mode: 'onSubmit',
  });

  // Watch the province field to filter addresses
  const selectedProvince = form.watch('provinceOfResidence');

  const onSubmit = async (values: ProfileFormData) => {
    setLoading(true);
    try {
      const result = await updateExaminerProfileAction({
        examinerProfileId,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        landlineNumber: values.landlineNumber,
        emailAddress: values.emailAddress,
        provinceOfResidence: values.provinceOfResidence,
        mailingAddress: values.mailingAddress,
      });

      if (result.success) {
        toast.success('Profile updated successfully');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <div className="rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]">
      <h2 className="mb-6 text-xl font-semibold">Profile Information</h2>

      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-6">
          {/* First Row - First Name, Last Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField name="firstName" label="First Name" required>
              {(field: UseFormRegisterReturn & { error?: boolean }) => (
                <Input
                  {...field}
                  placeholder="Dr. Sarah"
                  icon={User}
                  className="bg-[#F9F9F9]"
                  validationType="name"
                />
              )}
            </FormField>

            <FormField name="lastName" label="Last Name" required>
              {(field: UseFormRegisterReturn & { error?: boolean }) => (
                <Input
                  {...field}
                  placeholder="Ahmed"
                  icon={User}
                  className="bg-[#F9F9F9]"
                  validationType="name"
                />
              )}
            </FormField>
          </div>

          {/* Second Row - Phone Number, Landline Number */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormPhoneInput
              name="phoneNumber"
              label="Cell Phone"
              required
              className="bg-[#F9F9F9]"
            />

            <FormPhoneInput
              name="landlineNumber"
              label="Work Phone"
              className="bg-[#F9F9F9]"
              icon={PhoneCall}
            />
          </div>

          {/* Third Row - Email, Province */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField name="emailAddress" label="Email Address" hint="Email cannot be changed">
              {(field: UseFormRegisterReturn & { error?: boolean }) => (
                <Input
                  {...field}
                  placeholder="john.doe@example.com"
                  icon={Mail}
                  className="bg-[#F9F9F9]"
                  disabled
                />
              )}
            </FormField>

            <FormDropdown
              name="provinceOfResidence"
              label="Province of Residence"
              required
              options={provinces}
              placeholder="Select Province"
              from="settings-profile"
            />
          </div>

          {/* Fourth Row - Mailing Address */}
          <div className="grid grid-cols-1 gap-4">
            <FormGoogleMapsInput
              name="mailingAddress"
              label="Mailing Address"
              required
              from="settings-profile"
              province={selectedProvince}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-[20px] border-gray-300 px-6 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-[20px] bg-[#00A8FF] px-6 text-white hover:bg-[#0096E6]"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </FormProvider>
    </div>
  );
};

export default ProfileInformationSection;
