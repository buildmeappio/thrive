'use client';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormData {
  reasonForReferral: string;
  caseType: string;
  urgencyLevel: string;
  examFormat: string;
  requestedSpecialty: string;
  preferredLocation: string;
}

const CaseInfo: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      reasonForReferral: '',
      caseType: 'Motor Vehicle Accident',
      urgencyLevel: 'High',
      examFormat: 'Medical',
      requestedSpecialty: 'Medical',
      preferredLocation: 'Ontario',
    },
  });

  const formData = watch();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setValue(field, value);
  };

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  const caseTypes = [
    { value: 'Motor Vehicle Accident', label: 'Motor Vehicle Accident' },
    { value: 'Work Injury', label: 'Work Injury' },
    { value: 'Personal Injury', label: 'Personal Injury' },
    { value: 'Medical Malpractice', label: 'Medical Malpractice' },
  ];
  const urgencyLevels = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];
  const examFormats = [
    { value: 'Medical', label: 'Medical' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Independent', label: 'Independent' },
    { value: 'Psychological', label: 'Psychological' },
  ];
  const specialties = [
    { value: 'Medical', label: 'Medical' },
    { value: 'Orthopedic', label: 'Orthopedic' },
    { value: 'Neurological', label: 'Neurological' },
    { value: 'Psychiatric', label: 'Psychiatric' },
    { value: 'Physical Therapy', label: 'Physical Therapy' },
  ];
  const locations = [
    { value: 'Ontario', label: 'Ontario' },
    { value: 'Alberta', label: 'Alberta' },
    { value: 'British Columbia', label: 'British Columbia' },
    { value: 'Quebec', label: 'Quebec' },
    { value: 'Manitoba', label: 'Manitoba' },
  ];

  return (
    <div className="rounded-4xl bg-[#FFFFFF] p-4 sm:p-6 md:p-10">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-[36.02px]">
            Case Information
          </h1>
        </div>

        {/* Reason for referral */}
        <div className="mb-6 md:mb-8">
          <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label className="text-sm font-medium text-[#000000] md:text-[14.48px]">
              Reason for referral
            </Label>
            <Button
              type="button"
              variant="ghost"
              className="h-auto self-start bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text p-0 text-sm font-medium text-transparent hover:bg-transparent sm:self-auto md:text-[14.48px]"
            >
              Rewrite with AI
            </Button>
          </div>
          <Controller
            name="reasonForReferral"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Type here"
                className="h-32 w-full resize-none rounded-lg border-0 bg-[#F2F5F6]"
              />
            )}
          />
        </div>

        {/* Form Fields Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Case Type */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Controller
              name="caseType"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="caseType"
                  label="Case Type"
                  value={field.value}
                  onChange={(value: string) => handleInputChange('caseType', value)}
                  options={caseTypes}
                  placeholder="Select case type"
                />
              )}
            />
          </div>

          {/* Urgency Level */}
          <div className="sm:col-span-1 lg:col-span-1">
            <Controller
              name="urgencyLevel"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="urgencyLevel"
                  label="Urgency Level"
                  value={field.value}
                  onChange={(value: string) => handleInputChange('urgencyLevel', value)}
                  options={urgencyLevels}
                  placeholder="Select urgency"
                />
              )}
            />
          </div>

          {/* Exam Format */}
          <div className="sm:col-span-1 lg:col-span-2">
            <Controller
              name="examFormat"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="examFormat"
                  label="Exam Format"
                  value={field.value}
                  onChange={(value: string) => handleInputChange('examFormat', value)}
                  options={examFormats}
                  placeholder="Select exam format"
                />
              )}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-5">
          {/* Requested Specialty */}
          <div className="sm:col-span-1 lg:col-span-2">
            <Controller
              name="requestedSpecialty"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="requestedSpecialty"
                  label="Requested Specialty"
                  value={field.value}
                  onChange={(value: string) => handleInputChange('requestedSpecialty', value)}
                  options={specialties}
                  placeholder="Select specialty"
                />
              )}
            />
          </div>

          {/* Preferred Location */}
          <div className="sm:col-span-1 lg:col-span-2">
            <Controller
              name="preferredLocation"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="preferredLocation"
                  label="Preferred Location"
                  value={field.value}
                  onChange={(value: string) => handleInputChange('preferredLocation', value)}
                  options={locations}
                  placeholder="Select location"
                />
              )}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mt-12">
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center rounded-3xl border-[#000080] px-6 py-1 text-gray-700 hover:bg-gray-50 sm:w-auto sm:px-10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-[#000080] px-6 py-2 text-white hover:bg-[#000070] sm:w-auto sm:px-10"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CaseInfo;
