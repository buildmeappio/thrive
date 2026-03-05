'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  createTenantOrganization,
  checkTenantOrganizationNameExists,
} from '../../actions/organization.actions';

interface CreateOrganizationFormData {
  name: string;
  type: string;
  website: string;
}

interface CreateOrganizationFormErrors {
  name?: string;
  type?: string;
  website?: string;
}

export default function TenantCreateOrganizationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [formData, setFormData] = useState<CreateOrganizationFormData>({
    name: '',
    type: '',
    website: '',
  });
  const [errors, setErrors] = useState<CreateOrganizationFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof CreateOrganizationFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNameBlur = async () => {
    const name = formData.name.trim();
    if (name.length >= 2) {
      setIsCheckingName(true);
      try {
        const result = await checkTenantOrganizationNameExists(name);
        if (result.exists) {
          setErrors(prev => ({ ...prev, name: 'This organization name is already taken' }));
        }
      } catch (error) {
        console.error('Error checking organization name:', error);
      } finally {
        setIsCheckingName(false);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: CreateOrganizationFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Organization name must be at least 2 characters';
    }

    // Website validation (optional but if provided, should be valid URL)
    if (formData.website.trim() && !/^https?:\/\/.+/.test(formData.website.trim())) {
      newErrors.website = 'Please enter a valid URL (must start with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!validate()) {
        setIsSubmitting(false);
        return;
      }

      const result = await createTenantOrganization({
        name: formData.name.trim(),
        type: formData.type || undefined,
        website: formData.website || undefined,
      });

      if (result.success && result.organizationId) {
        toast.success('Organization created successfully!');
        router.push(`/admin/organization/${result.organizationId}`);
      } else {
        toast.error(result.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim().length >= 2 && !isCheckingName;
  };

  return (
    <TenantDashboardShell>
      {/* Back Button and Heading */}
      <div className="mb-6 flex flex-shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/admin/organization" className="flex-shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
            <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
          </div>
        </Link>
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Create Organization
        </h1>
      </div>

      <div className="flex w-full flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 lg:px-12"
        >
          {/* Organization Name */}
          <div className="mb-6 flex flex-col">
            <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
              Organization Name
              <span className="ml-1 text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleNameBlur}
              placeholder="Enter organization name"
              maxLength={100}
              className={`h-14 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
              disabled={isCheckingName}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            {isCheckingName && (
              <p className="mt-1 text-xs text-gray-400">Checking availability...</p>
            )}
          </div>

          {/* Organization Type */}
          <div className="mb-6 flex flex-col">
            <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
              Organization Type
            </label>
            <Input
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Enter organization type (optional)"
              maxLength={255}
              className={`h-14 ${errors.type ? 'ring-2 ring-red-500' : ''}`}
            />
            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
          </div>

          {/* Website */}
          <div className="mb-6 flex flex-col">
            <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
              Website
            </label>
            <Input
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com (optional)"
              maxLength={255}
              className={`h-14 ${errors.website ? 'ring-2 ring-red-500' : ''}`}
            />
            {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website}</p>}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid() || isCheckingName || isSubmitting}
              className={`font-poppins flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-10 py-2 text-sm font-medium text-white transition-opacity sm:text-base ${
                !isFormValid() || isCheckingName || isSubmitting
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </TenantDashboardShell>
  );
}
