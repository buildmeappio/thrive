import React from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dropdown } from '@/components/ui/Dropdown';
import { Upload, X } from 'lucide-react';
import { CaseType } from '@/shared/config/caseType.config';
import { UrgencyLevels } from '@/shared/config/urgencyLevel.config';
import { ExamFormat } from '@/shared/config/examFormat.config';
import { provinceOptions } from '@/shared/config/ProvinceOptions';
import { RequestedSpecialty } from '@/shared/config/requestedSpecialty.config';
import { DocumentUploadConfig } from '@/shared/config/documentUpload.config';
import { type CaseInfo } from '@/shared/validation/imeReferral/imeReferralValidation';

interface CaseFormFieldsProps {
  control: Control<CaseInfo>;
  errors: FieldErrors<CaseInfo>;
  watch: UseFormWatch<CaseInfo>;
  setValue: UseFormSetValue<CaseInfo>;
  isSubmitting: boolean;
  onAiRewrite: () => void;
}

const CaseFormFields: React.FC<CaseFormFieldsProps> = ({
  control,
  errors,
  watch,
  setValue,
  isSubmitting,
  onAiRewrite,
}) => {
  // const watchedValues = watch();
  const files = watch('files');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    setValue('files', [...files, ...newFiles], { shouldValidate: true });
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setValue(
      'files',
      files.filter(file => file !== fileToRemove),
      { shouldValidate: true }
    );
  };

  return (
    <>
      {/* Reason for referral */}
      <div className="mb-6 w-full max-w-full">
        <div className="mb-1 flex w-full max-w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label
            htmlFor="reason"
            className="text-sm font-medium break-words text-black md:text-[14.48px]"
          >
            Reason for referral <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            onClick={onAiRewrite}
            disabled={isSubmitting}
            className="h-auto flex-shrink-0 self-start bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text p-0 text-sm font-medium text-transparent hover:bg-transparent hover:opacity-80 disabled:opacity-50 sm:self-auto md:text-[14.48px]"
          >
            Rewrite with AI
          </Button>
        </div>
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <>
              <Textarea
                disabled={isSubmitting}
                {...field}
                id="reason"
                placeholder="Provide a detailed reason for the referral..."
                className={`h-32 w-full max-w-full resize-none rounded-lg border-0 bg-[#F2F5F6] disabled:opacity-50 ${
                  errors.reason ? 'border-red-500' : ''
                }`}
                aria-describedby={errors.reason ? 'reason-error' : undefined}
              />
              {errors.reason && (
                <p id="reason-error" className="mt-1 text-sm break-words text-red-600" role="alert">
                  {errors.reason.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Form Fields Grid */}
      <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Case Type */}
        <div className="min-w-0 sm:col-span-2 lg:col-span-2">
          <Controller
            name="caseType"
            control={control}
            render={({ field }) => (
              <>
                <Dropdown
                  id="caseType"
                  label="Case Type"
                  required
                  value={field.value}
                  onChange={(val: string) => {
                    field.onChange(val);
                  }}
                  options={CaseType}
                  placeholder="Select case type"
                  className={`w-full ${errors.caseType ? 'border-red-500' : ''}`}
                />
                {errors.caseType && (
                  <p className="mt-1 text-sm break-words text-red-600" role="alert">
                    {errors.caseType.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* Urgency Level */}
        <div className="min-w-0 sm:col-span-1 lg:col-span-1">
          <Controller
            name="urgencyLevel"
            control={control}
            render={({ field }) => (
              <>
                <Dropdown
                  id="urgencyLevel"
                  label="Urgency Level"
                  required
                  value={field.value}
                  onChange={(val: string) => {
                    field.onChange(val);
                  }}
                  options={UrgencyLevels}
                  placeholder="Select urgency"
                  className={`w-full ${errors.urgencyLevel ? 'border-red-500' : ''}`}
                />
                {errors.urgencyLevel && (
                  <p className="mt-1 text-sm break-words text-red-600" role="alert">
                    {errors.urgencyLevel.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* Exam Format */}
        <div className="min-w-0 sm:col-span-1 lg:col-span-2">
          <Controller
            name="examFormat"
            control={control}
            render={({ field }) => (
              <>
                <Dropdown
                  id="examFormat"
                  label="Exam Format"
                  required
                  value={field.value}
                  onChange={(val: string) => {
                    field.onChange(val);
                  }}
                  options={ExamFormat}
                  placeholder="Select exam format"
                  className={`w-full ${errors.examFormat ? 'border-red-500' : ''}`}
                />
                {errors.examFormat && (
                  <p className="mt-1 text-sm break-words text-red-600" role="alert">
                    {errors.examFormat.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Requested Specialty */}
        <div className="min-w-0 sm:col-span-1 lg:col-span-2">
          <Controller
            name="requestedSpecialty"
            control={control}
            render={({ field }) => (
              <>
                <Dropdown
                  id="requestedSpecialty"
                  label="Requested Specialty"
                  required
                  value={field.value}
                  onChange={(val: string) => {
                    field.onChange(val);
                  }}
                  options={RequestedSpecialty}
                  placeholder="Select specialty"
                  className={`w-full ${errors.requestedSpecialty ? 'border-red-500' : ''}`}
                />
                {errors.requestedSpecialty && (
                  <p className="mt-1 text-sm break-words text-red-600" role="alert">
                    {errors.requestedSpecialty.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* Preferred Location */}
        <div className="min-w-0 sm:col-span-1 lg:col-span-2">
          <Controller
            name="preferredLocation"
            control={control}
            render={({ field }) => (
              <>
                <Dropdown
                  id="preferredLocation"
                  label="Preferred Location"
                  required
                  value={field.value}
                  onChange={(val: string) => {
                    field.onChange(val);
                  }}
                  options={provinceOptions}
                  placeholder="Select location"
                  className={`w-full ${errors.preferredLocation ? 'border-red-500' : ''}`}
                />
                {errors.preferredLocation && (
                  <p className="mt-1 text-sm break-words text-red-600" role="alert">
                    {errors.preferredLocation.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="mb-6 w-full max-w-full">
        <Label className="mb-3 block text-sm font-medium break-words text-black md:text-[14.48px]">
          Upload Documents <span className="text-red-500">*</span>
        </Label>

        {/* Upload Box */}
        <Controller
          name="files"
          control={control}
          render={() => (
            <>
              <div
                className={`mb-4 flex w-full max-w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#F9FAFB] px-4 py-8 text-center sm:px-6 ${
                  isSubmitting ? 'pointer-events-none opacity-50' : ''
                } ${errors.files ? 'border-red-500' : ''}`}
              >
                <Upload className="mb-3 h-10 w-10 flex-shrink-0 text-[#000093]" />
                <p className="px-2 font-medium break-words text-gray-700">
                  Drag & drop files or{' '}
                  <label
                    htmlFor="fileUpload"
                    className={`cursor-pointer text-[#000093] underline ${
                      isSubmitting ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    Browse
                  </label>
                </p>
                <input
                  id="fileUpload"
                  type="file"
                  multiple
                  accept={DocumentUploadConfig.ALLOWED_FILE_TYPES.join(',')}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                <p className="mt-2 px-2 text-sm break-words text-gray-500">
                  Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
                </p>
              </div>
              {errors.files && (
                <p className="mb-4 px-2 text-sm break-words text-red-600" role="alert">
                  {errors.files.message}
                </p>
              )}
            </>
          )}
        />

        {/* File List */}
        {files.length > 0 && (
          <div className="w-full max-w-full">
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex w-full max-w-full min-w-0 items-center justify-between rounded-lg border bg-white px-4 py-2 shadow-sm"
                >
                  <span className="min-w-0 flex-1 truncate pr-2 text-gray-700">{file.name}</span>
                  <Button
                    type="button"
                    className={`flex-shrink-0 bg-white text-red-500 hover:bg-white hover:text-red-700 ${
                      isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={() => handleRemoveFile(file)}
                    disabled={isSubmitting}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default CaseFormFields;
