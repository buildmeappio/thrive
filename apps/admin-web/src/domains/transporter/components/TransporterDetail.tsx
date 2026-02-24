'use client';

import React, { useState } from 'react';
import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { cn } from '@/lib/utils';
import { TransporterData } from '../types/TransporterData';
import { updateTransporter, deleteTransporter } from '../server';
import { Check, Edit, X, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatPhoneNumber } from '@/utils/phone';
import PhoneInput from '@/components/PhoneNumber';
import { capitalizeWords } from '@/utils/text';
import { provinceOptions } from '@/constants/options';
import { TRANSPORTER_STATUSES } from '../types/TransporterData';
import { TransporterFormHandler } from '../server/handlers/transporterForm.handler';
import {
  AvailabilityTabs,
  WeeklyHoursState,
  OverrideHoursState,
  weeklyStateToArray,
  weeklyArrayToState,
  overrideStateToArray,
  overrideArrayToState,
  overrideDateToLocalDate,
  formatOverrideDisplayDate,
} from '@/components/availability';
import { format } from 'date-fns';
import { saveTransporterAvailabilityAction } from '../server/actions/saveAvailability';
import { useRouter } from 'next/navigation';
import { showDeleteConfirmation } from '@/components';
import Link from 'next/link';
import logger from '@/utils/logger';

const mapStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

type Props = {
  transporter: TransporterData;
  initialAvailability: {
    weeklyHours: WeeklyHoursState;
    overrideHours: OverrideHoursState;
  } | null;
};

const getDefaultWeeklyHours = (): WeeklyHoursState => ({
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

export default function TransporterDetail({ transporter, initialAvailability }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: transporter.companyName,
    contactPerson: transporter.contactPerson,
    phone: transporter.phone,
    email: transporter.email,
    status: transporter.status,
    serviceAreas: transporter.serviceAreas || [],
  });
  const hasAvailability = initialAvailability !== null;
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursState>(
    initialAvailability?.weeklyHours || getDefaultWeeklyHours()
  );
  const [overrideHours, setOverrideHours] = useState<OverrideHoursState>(
    initialAvailability?.overrideHours || []
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate and sanitize form data using the handler
      const validation = TransporterFormHandler.validateAndSanitizeFormData(formData);

      if (!validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        setIsLoading(false);
        return;
      }

      const updateData = {
        ...validation.sanitizedData!,
        phone: formData.phone.trim() || undefined,
        status: formData.status, // Include the status field
      };

      logger.log('Updating transporter with data:', updateData);

      const result = await updateTransporter(transporter.id, updateData);
      if (result.success) {
        await saveTransporterAvailabilityAction({
          transporterId: transporter.id,
          weeklyHours,
          overrideHours,
        } as any);
        toast.success('Transporter updated successfully');
        setIsEditing(false);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to update transporter');
      }
    } catch (error) {
      toast.error('An error occurred while updating transporter', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      companyName: transporter.companyName,
      contactPerson: transporter.contactPerson,
      phone: transporter.phone,
      email: transporter.email,
      status: transporter.status,
      serviceAreas: transporter.serviceAreas || [],
    });
    // Reset availability to initial state
    setWeeklyHours(initialAvailability?.weeklyHours || getDefaultWeeklyHours());
    setOverrideHours(initialAvailability?.overrideHours || []);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    showDeleteConfirmation(transporter.companyName, async () => {
      setIsDeleting(true);
      try {
        const result = await deleteTransporter(transporter.id);
        if (result.success) {
          toast.success('Transporter deleted successfully');
          router.push('/transporter');
        } else {
          toast.error(result.error || 'Failed to delete transporter');
        }
      } catch (error) {
        toast.error('An error occurred while deleting transporter', error);
      } finally {
        setIsDeleting(false);
      }
    });
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

  // Validation handlers
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
      {/* Header with Back Button */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/transporter" className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {capitalizeWords(transporter.companyName)}
          </h1>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          {isEditing ? (
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-green-700 disabled:opacity-50 sm:flex-initial sm:px-4 sm:py-2 sm:text-base"
              >
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-500 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-gray-600 sm:flex-initial sm:px-4 sm:py-2 sm:text-base"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-100 sm:flex-initial sm:px-4 sm:py-2 sm:text-base"
              >
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:px-4 sm:py-2 sm:text-base"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-sm font-medium">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layout - Changes based on edit mode */}
      {isEditing ? (
        // Edit Mode: Single column layout with everything stacked
        <div className="rounded-lg bg-white p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <Section title="Basic Information">
              <div className="space-y-4">
                <FieldRow
                  label="Company Name *"
                  type="text"
                  value={
                    <div>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={handleCompanyNameChange}
                        onBlur={handleCompanyNameBlur}
                        maxLength={25}
                        className={cn(
                          'w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2',
                          TransporterFormHandler.isOnlySpaces(formData.companyName)
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#00A8FF]'
                        )}
                        placeholder="Enter company name (alphabets only, max 25)"
                      />
                      {TransporterFormHandler.isOnlySpaces(formData.companyName) && (
                        <p className="mt-1 text-xs text-red-500">
                          Company name cannot be only spaces
                        </p>
                      )}
                    </div>
                  }
                />
                <FieldRow
                  label="Contact Person *"
                  type="text"
                  value={
                    <div>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={handleContactPersonChange}
                        onBlur={handleContactPersonBlur}
                        maxLength={25}
                        className={cn(
                          'w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2',
                          TransporterFormHandler.isOnlySpaces(formData.contactPerson)
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#00A8FF]'
                        )}
                        placeholder="Enter contact person name (alphabets only, max 25)"
                      />
                      {TransporterFormHandler.isOnlySpaces(formData.contactPerson) && (
                        <p className="mt-1 text-xs text-red-500">
                          Contact person cannot be only spaces
                        </p>
                      )}
                    </div>
                  }
                />
                <FieldRow
                  label="Email *"
                  type="text"
                  value={
                    <div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        onKeyDown={handleEmailKeyDown}
                        className={cn(
                          'w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2',
                          formData.email && !TransporterFormHandler.isValidEmail(formData.email)
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#00A8FF]'
                        )}
                        placeholder="Enter email address"
                      />
                      {formData.email && !TransporterFormHandler.isValidEmail(formData.email) && (
                        <p className="mt-1 text-xs text-red-500">
                          Please enter a valid email address
                        </p>
                      )}
                    </div>
                  }
                />
                <FieldRow
                  label="Phone *"
                  type="text"
                  value={
                    <PhoneInput
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full"
                    />
                  }
                />
              </div>
            </Section>

            {/* Availability */}
            <AvailabilityTabs
              weeklyHours={weeklyStateToArray(weeklyHours)}
              overrideHours={overrideStateToArray(overrideHours)}
              onWeeklyHoursChange={updated => setWeeklyHours(weeklyArrayToState(updated))}
              onOverrideHoursChange={updated => setOverrideHours(overrideArrayToState(updated))}
              disabled={!isEditing}
            />

            {/* Service Provinces - Below Availability in Edit Mode */}
            <Section title="Service Provinces">
              <div className="w-full min-w-0 space-y-4">
                <div className="w-full min-w-0">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select Provinces <span className="text-red-500">*</span>
                  </label>
                  <div className="flex max-h-64 w-full min-w-0 flex-col gap-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                    {provinceOptions.map(option => (
                      <label
                        key={option.value}
                        className="flex min-w-0 cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceAreas.some(
                            area => area.province === option.value
                          )}
                          onChange={() => toggleProvince(option.value)}
                          className="flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="min-w-0 truncate text-base">{option.label}</span>
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

            {/* Status Management - Below Service Provinces in Edit Mode */}
            <Section title="Status Management">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRANSPORTER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </Section>
          </div>
        </div>
      ) : (
        <>
          {/* View Mode: Two column layout */}
          <div className="grid grid-cols-1 gap-6 rounded-lg bg-white p-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* Left Column - Basic Information */}
            <div className="w-full min-w-0 space-y-6">
              <Section title="Basic Information">
                <div className="space-y-4">
                  <FieldRow
                    label="Company Name"
                    type="text"
                    value={capitalizeWords(transporter.companyName)}
                  />
                  <FieldRow
                    label="Contact Person"
                    type="text"
                    value={capitalizeWords(transporter.contactPerson)}
                  />
                  <FieldRow label="Email" type="text" value={transporter.email} />
                  <FieldRow
                    label="Phone"
                    type="text"
                    value={formatPhoneNumber(transporter.phone)}
                  />
                </div>
              </Section>
            </div>

            {/* Right Column - Service Provinces */}
            <div className="w-full min-w-0 max-w-full space-y-6">
              <Section title="Service Provinces">
                <div className="space-y-2">
                  {(transporter.serviceAreas || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(transporter.serviceAreas || []).map(area => (
                        <span
                          key={area.province}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          {provinceOptions.find(p => p.value === area.province)?.label ||
                            area.province}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No provinces selected</p>
                  )}
                </div>
              </Section>

              {/* Status Management - Bottom Right */}
              <Section title="Status Management">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium',
                      mapStatus[transporter.status] === 'active' && 'bg-green-100 text-green-800',
                      mapStatus[transporter.status] === 'suspended' && 'bg-red-100 text-red-800'
                    )}
                  >
                    {transporter.status === 'ACTIVE' && 'Active'}
                    {transporter.status === 'SUSPENDED' && 'Suspended'}
                  </span>
                </div>
              </Section>
            </div>
          </div>

          {/* Availability - Separate Card in View Mode */}
          {hasAvailability && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-6">
                <h2 className="font-poppins text-xl font-semibold text-black">Availability</h2>
              </div>
              <div className="p-6">
                {(() => {
                  const weeklyHoursArray = weeklyStateToArray(weeklyHours);
                  const overrideHoursArray = overrideStateToArray(overrideHours);
                  const hasWeeklyHours = weeklyHoursArray.filter(wh => wh.enabled).length > 0;
                  const hasOverrideHours = overrideHoursArray.length > 0;

                  return (
                    <>
                      {/* Weekly Hours */}
                      {hasWeeklyHours && (
                        <div className="mb-8">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#00A8FF] to-[#01F4C8]"></div>
                            <h3 className="font-poppins text-lg font-semibold text-gray-900">
                              Weekly Schedule
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {weeklyHoursArray
                              .filter(wh => wh.enabled)
                              .map(wh => (
                                <div
                                  key={wh.id || wh.dayOfWeek}
                                  className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 transition-shadow hover:shadow-md"
                                >
                                  <div className="mb-3 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]"></div>
                                    <p className="font-poppins text-base font-semibold text-gray-900">
                                      {wh.dayOfWeek.charAt(0) + wh.dayOfWeek.slice(1).toLowerCase()}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    {wh.timeSlots.map((slot, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2"
                                      >
                                        <svg
                                          className="h-4 w-4 text-[#00A8FF]"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        <p className="font-poppins text-sm font-medium text-gray-700">
                                          {slot.startTime} - {slot.endTime}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Override Hours */}
                      {hasOverrideHours && (
                        <div>
                          <div className="mb-4 flex items-center gap-2">
                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#FF6B6B] to-[#FFA500]"></div>
                            <h3 className="font-poppins text-lg font-semibold text-gray-900">
                              Special Dates
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {overrideHoursArray.map(oh => (
                              <div
                                key={oh.id || oh.date}
                                className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50 p-4 transition-shadow hover:shadow-md"
                              >
                                <div className="mb-3 flex items-center gap-2">
                                  <svg
                                    className="h-5 w-5 text-orange-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <p className="font-poppins text-base font-semibold text-gray-900">
                                    {(() => {
                                      const localDate = overrideDateToLocalDate(oh.date);
                                      return localDate
                                        ? format(localDate, 'EEEE, MMM dd, yyyy')
                                        : formatOverrideDisplayDate(oh.date);
                                    })()}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {oh.timeSlots.map((slot, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2"
                                    >
                                      <svg
                                        className="h-4 w-4 text-orange-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      <p className="font-poppins text-sm font-medium text-gray-700">
                                        {slot.startTime} - {slot.endTime}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasWeeklyHours && !hasOverrideHours && (
                        <div className="py-12 text-center">
                          <svg
                            className="mx-auto mb-4 h-16 w-16 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="font-poppins text-lg text-gray-500">No availability set</p>
                          <p className="font-poppins mt-1 text-sm text-gray-400">
                            Schedule has not been configured yet
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
