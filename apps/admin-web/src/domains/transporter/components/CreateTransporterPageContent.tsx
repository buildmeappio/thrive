'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Section from '@/components/Section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/PhoneNumber';
import { saveTransporterAvailabilityAction } from '../server/actions/saveAvailability';
import { createTransporter } from '../server/actions';
import { toast } from 'sonner';
import { provinceOptions } from '@/constants/options';
import { cn } from '@/lib/utils';
import { TransporterFormHandler } from '../server/handlers/transporterForm.handler';
import {
  AvailabilityTabs,
  WeeklyHoursState,
  OverrideHoursState,
  weeklyStateToArray,
  weeklyArrayToState,
  overrideStateToArray,
  overrideArrayToState,
} from '@/components/availability';

export default function CreateTransporterPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    serviceAreas: [],
  });
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursState>({
    sunday: {
      enabled: false,
      timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
    },
    monday: {
      enabled: true,
      timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
    },
    tuesday: {
      enabled: true,
      timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
    },
    wednesday: {
      enabled: true,
      timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
    },
    thursday: {
      enabled: true,
      timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
    },
    friday: {
      enabled: true,
      timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
    },
    saturday: {
      enabled: false,
      timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
    },
  });
  const [overrideHours, setOverrideHours] = useState<OverrideHoursState>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate and sanitize form data using the handler
      const validation = TransporterFormHandler.validateAndSanitizeFormData(formData);

      if (!validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        setIsLoading(false);
        return;
      }

      const result = await createTransporter(validation.sanitizedData!);

      if (result.success && result.data?.id) {
        // Save availability after transporter is created
        await saveTransporterAvailabilityAction({
          transporterId: result.data.id,
          weeklyHours,
          overrideHours,
        } as any);

        toast.success('Transporter created successfully');
        router.push('/transporter');
      } else {
        toast.error(result.error || 'Failed to create transporter');
      }
    } catch (error) {
      toast.error('An error occurred while creating transporter', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProvince = (province: string) => {
    setFormData(prev => {
      const existingAreas = prev.serviceAreas || [];
      const existingProvince = existingAreas.find(area => area.province === province);

      if (existingProvince) {
        // Remove the province
        return {
          ...prev,
          serviceAreas: existingAreas.filter(area => area.province !== province),
        };
      } else {
        // Add the province
        return {
          ...prev,
          serviceAreas: [...existingAreas, { province, address: '' }],
        };
      }
    });
  };

  // Input handlers using the form handler service
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = TransporterFormHandler.handleCompanyNameChange(e.target.value);
    setFormData(prev => ({ ...prev, companyName: sanitizedValue }));
  };

  const handleCompanyNameBlur = () => {
    const trimmedValue = TransporterFormHandler.handleCompanyNameBlur(formData.companyName);
    setFormData(prev => ({ ...prev, companyName: trimmedValue }));
  };

  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = TransporterFormHandler.handleContactPersonChange(e.target.value);
    setFormData(prev => ({ ...prev, contactPerson: sanitizedValue }));
  };

  const handleContactPersonBlur = () => {
    const trimmedValue = TransporterFormHandler.handleContactPersonBlur(formData.contactPerson);
    setFormData(prev => ({ ...prev, contactPerson: trimmedValue }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = TransporterFormHandler.handleEmailChange(e.target.value);
    setFormData(prev => ({ ...prev, email: sanitizedValue }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault(); // Prevent spacebar from being typed
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/transporter" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ChevronLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Transporter</h1>
            <p className="text-gray-600">Add a new medical transportation service provider</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-8 rounded-lg bg-white p-6 lg:grid-cols-2">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <Section title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.companyName}
                  onChange={handleCompanyNameChange}
                  onBlur={handleCompanyNameBlur}
                  maxLength={25}
                  className={cn(
                    TransporterFormHandler.isOnlySpaces(formData.companyName)
                      ? 'border-red-300 focus:ring-red-500'
                      : ''
                  )}
                  placeholder="Enter company name (alphabets only, max 25)"
                  required
                />
                {TransporterFormHandler.isOnlySpaces(formData.companyName) && (
                  <p className="mt-1 text-xs text-red-500">Company name cannot be only spaces</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.contactPerson}
                  onChange={handleContactPersonChange}
                  onBlur={handleContactPersonBlur}
                  maxLength={25}
                  className={cn(
                    TransporterFormHandler.isOnlySpaces(formData.contactPerson)
                      ? 'border-red-300 focus:ring-red-500'
                      : ''
                  )}
                  placeholder="Enter contact person name (alphabets only, max 25)"
                  required
                />
                {TransporterFormHandler.isOnlySpaces(formData.contactPerson) && (
                  <p className="mt-1 text-xs text-red-500">Contact person cannot be only spaces</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  className={cn(
                    formData.email && !TransporterFormHandler.isValidEmail(formData.email)
                      ? 'border-red-300 focus:ring-red-500'
                      : ''
                  )}
                  placeholder="Enter email address"
                  required
                />
                {formData.email && !TransporterFormHandler.isValidEmail(formData.email) && (
                  <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={cn(
                    formData.phone && !TransporterFormHandler.isValidPhone(formData.phone)
                      ? 'border-red-300 focus:ring-red-500'
                      : ''
                  )}
                />
                {formData.phone && !TransporterFormHandler.isValidPhone(formData.phone) && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a valid Canadian phone number
                  </p>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Right Column - Service Provinces */}
        <div className="space-y-6">
          <Section title="Service Provinces">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Provinces <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
                  {provinceOptions.map(option => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={formData.serviceAreas.some(area => area.province === option.value)}
                        onChange={() => toggleProvince(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
                {formData.serviceAreas.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-600">Selected provinces:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.serviceAreas.map(area => (
                        <span
                          key={area.province}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {provinceOptions.find(p => p.value === area.province)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Availability Section - Full Width */}
        <div className="col-span-full">
          <AvailabilityTabs
            weeklyHours={weeklyStateToArray(weeklyHours)}
            overrideHours={overrideStateToArray(overrideHours)}
            onWeeklyHoursChange={updated => setWeeklyHours(weeklyArrayToState(updated))}
            onOverrideHoursChange={updated => setOverrideHours(overrideArrayToState(updated))}
            disabled={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="col-span-full flex flex-col justify-end gap-3 border-t pt-4 sm:flex-row sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full px-3 py-1.5 text-sm sm:w-auto sm:px-4 sm:py-2 sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 py-1.5 text-sm text-white shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80 sm:w-auto sm:px-4 sm:py-2 sm:text-base"
          >
            {isLoading ? 'Creating...' : 'Create Transporter'}
          </Button>
        </div>
      </div>
    </div>
  );
}
