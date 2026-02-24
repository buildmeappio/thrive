'use client';

import React from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { provinceOptions } from '@/config/ProvinceOptions';
import { type DropdownOption } from '@/domains/ime-referral/types/CaseInfo';
import { type ClaimantAvailabilityFormData } from '../schemas/claimantAvailability';
import ToggleSwitch from '@/components/ToggleSwtch';

type AddOnServicesProps = {
  form: UseFormReturn<ClaimantAvailabilityFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
  languages: DropdownOption[];
};

const AddOnServices: React.FC<AddOnServicesProps> = ({
  form,
  onSubmit,
  isSubmitting,
  languages: languageOptions,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const formData = watch();

  const handleToggleChange = (field: keyof ClaimantAvailabilityFormData, value: boolean) => {
    setValue(field, value, { shouldValidate: true });

    // Clear dependent fields when toggling off
    switch (field) {
      case 'interpreter':
        if (!value) setValue('interpreterLanguage', '', { shouldValidate: true });
        break;
      case 'transportation':
        if (!value) {
          setValue('pickupAddress', '', { shouldValidate: true });
          setValue('streetAddress', '', { shouldValidate: true });
          setValue('aptUnitSuite', '', { shouldValidate: true });
          setValue('city', '', { shouldValidate: true });
          setValue('postalCode', '', { shouldValidate: true });
          setValue('province', '', { shouldValidate: true });
        }
        break;
      case 'additionalNotes':
        if (!value) setValue('additionalNotesText', '', { shouldValidate: true });
        break;
    }
  };

  return (
    <div className="w-full max-w-full px-2 sm:px-4 lg:px-2">
      <div className="w-full py-8 md:py-12" style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}>
        <div className="w-full max-w-full">
          <div className="w-full max-w-full space-y-6 md:space-y-8">
            <div className="w-full max-w-full px-4 sm:px-6 md:px-0">
              <h2 className="mb-6 text-center text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#000000] sm:mb-8 sm:text-[32px] sm:leading-[36.02px] md:text-[36px] lg:text-[39px]">
                Add-On Services
              </h2>

              {/* Interpreter Section */}
              <div className="mb-6 sm:mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-black sm:text-lg">Interpreter</h3>
                  <ToggleSwitch
                    enabled={formData.interpreter}
                    onChange={value => handleToggleChange('interpreter', value)}
                    disabled={isSubmitting}
                  />
                </div>

                {formData.interpreter && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interpreterLanguage" className="text-sm text-gray-600">
                        Select a Language
                      </Label>
                      <Dropdown
                        id="interpreterLanguage"
                        label=""
                        value={formData.interpreterLanguage || ''}
                        onChange={(val: string) =>
                          setValue('interpreterLanguage', val, { shouldValidate: true })
                        }
                        options={languageOptions}
                        placeholder="Select Language"
                        className="w-full"
                        icon={false}
                      />
                      {errors.interpreterLanguage && (
                        <div className="text-sm text-red-500">
                          {errors.interpreterLanguage.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Transportation Section */}
              <div className="mb-6 sm:mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-black sm:text-lg">Transportation</h3>
                  <ToggleSwitch
                    enabled={formData.transportation}
                    onChange={value => handleToggleChange('transportation', value)}
                    disabled={isSubmitting}
                  />
                </div>

                {formData.transportation && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Address Lookup */}
                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress" className="text-sm text-gray-600">
                        Pick-Up Address Lookup<span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          {...register('pickupAddress')}
                          disabled={isSubmitting}
                          placeholder="150 John Street"
                          className="w-full pl-10"
                        />
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                      {errors.pickupAddress && (
                        <div className="text-sm text-red-500">{errors.pickupAddress.message}</div>
                      )}
                    </div>

                    {/* Street / Apt / City */}
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="streetAddress" className="text-sm text-gray-600">
                          Street Address
                        </Label>
                        <Input
                          {...register('streetAddress')}
                          disabled={isSubmitting}
                          placeholder="50 Stephanie Street"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="aptUnitSuite" className="text-sm text-gray-600">
                          Apt / Unit / Suite
                        </Label>
                        <Input
                          {...register('aptUnitSuite')}
                          disabled={isSubmitting}
                          placeholder="402"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="city" className="text-sm text-gray-600">
                          City
                        </Label>
                        <Input
                          {...register('city')}
                          disabled={isSubmitting}
                          placeholder="Toronto"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Postal Code / Province */}
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm text-gray-600">
                          Postal Code
                        </Label>
                        <Input
                          {...register('postalCode')}
                          disabled={isSubmitting}
                          placeholder="A1A 1A1"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="province" className="text-sm text-gray-600">
                          Province / State
                        </Label>
                        <Dropdown
                          id="province"
                          label=""
                          value={formData.province || ''}
                          onChange={(val: string) =>
                            setValue('province', val, { shouldValidate: true })
                          }
                          options={provinceOptions}
                          placeholder="Select Province"
                          className="w-full"
                          icon={false}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chaperone Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-black sm:text-lg">Chaperone</h3>
                  <ToggleSwitch
                    enabled={formData.chaperone}
                    onChange={value => handleToggleChange('chaperone', value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="mb-6 sm:mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-black sm:text-lg">
                    Additional Notes
                  </h3>
                  <ToggleSwitch
                    enabled={formData.additionalNotes}
                    onChange={value => handleToggleChange('additionalNotes', value)}
                    disabled={isSubmitting}
                  />
                </div>

                {formData.additionalNotes && (
                  <div className="space-y-2">
                    <textarea
                      {...register('additionalNotesText')}
                      placeholder="Type here"
                      className="min-h-[120px] w-full resize-none rounded-md border border-[#F2F5F6] bg-[#F2F5F6] px-3 py-2 focus:border-[#000080] focus:outline-none focus:ring-1 focus:ring-[#000080]"
                      disabled={isSubmitting}
                    />
                    {errors.additionalNotesText && (
                      <div className="text-sm text-red-500">
                        {errors.additionalNotesText.message}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreement"
                    {...register('agreement')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#000080] focus:ring-[#000080]"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="agreement" className="text-sm leading-5 text-gray-700">
                    By submitting this form, you agree that Thrive may use this information solely
                    for the purpose of scheduling your medical assessment.
                  </label>
                </div>
                {errors.agreement && (
                  <div className="mt-2 text-sm text-red-500">{errors.agreement.message}</div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="flex cursor-pointer items-center space-x-2 rounded-full bg-[#000080] px-6 py-3 text-sm font-medium text-white transition-opacity hover:bg-[#000070] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8 sm:text-base"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit My Availability'}</span>
                  {!isSubmitting && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOnServices;
