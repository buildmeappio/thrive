'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { provinceOptions } from '@/shared/config/ProvinceOptions';
import { toast } from 'sonner';

// Types for the form
interface AddOnServicesForm {
  interpreter: boolean;
  interpreterLanguage: string;
  transportation: boolean;
  pickupAddress: string;
  streetAddress: string;
  aptUnitSuite: string;
  city: string;
  postalCode: string;
  province: string;
  chaperone: boolean;
  additionalNotes: boolean;
  additionalNotesText: string;
  agreement: boolean;
}

// Language options
const languageOptions = [
  { label: 'English', value: 'english' },
  { label: 'French', value: 'french' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'Mandarin', value: 'mandarin' },
  { label: 'Arabic', value: 'arabic' },
];

// Toggle Switch Component
const ToggleSwitch = ({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
      enabled ? 'bg-[#000080]' : 'bg-gray-200'
    } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    disabled={disabled}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const AddOnServices = () => {
  const [interpreterEnabled, setInterpreterEnabled] = useState(true);
  const [transportationEnabled, setTransportationEnabled] = useState(true);
  const [chaperoneEnabled, setChaperoneEnabled] = useState(true);
  const [additionalNotesEnabled, setAdditionalNotesEnabled] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddOnServicesForm>({
    defaultValues: {
      interpreter: false,
      interpreterLanguage: '',
      transportation: false,
      pickupAddress: '',
      streetAddress: '',
      aptUnitSuite: '',
      city: '',
      postalCode: '',
      province: '',
      chaperone: false,
      additionalNotes: false,
      additionalNotesText: '',
      agreement: false,
    },
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<AddOnServicesForm> = values => {
    console.log(values);
    toast.success('Form submitted successfully!');
  };

  // Sync toggle states with form values
  const handleToggleChange = (field: keyof AddOnServicesForm, value: boolean) => {
    setValue(field, value);

    switch (field) {
      case 'interpreter':
        setInterpreterEnabled(value);
        if (!value) setValue('interpreterLanguage', '');
        break;
      case 'transportation':
        setTransportationEnabled(value);
        if (!value) {
          setValue('pickupAddress', '');
          setValue('streetAddress', '');
          setValue('aptUnitSuite', '');
          setValue('city', '');
          setValue('postalCode', '');
          setValue('province', '');
        }
        break;
      case 'chaperone':
        setChaperoneEnabled(value);
        break;
      case 'additionalNotes':
        setAdditionalNotesEnabled(value);
        if (!value) setValue('additionalNotesText', '');
        break;
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="w-full md:py-12" style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full md:space-y-8">
            <div className="w-full max-w-full px-4 md:px-0">
              <h2 className="mb-8 text-center text-[39px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-[36.02px]">
                Add-On Services
              </h2>

              {/* Interpreter Section */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black">Interpreter</h3>
                  <ToggleSwitch
                    enabled={interpreterEnabled}
                    onChange={value => handleToggleChange('interpreter', value)}
                  />
                </div>

                {interpreterEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interpreterLanguage" className="text-sm text-gray-600">
                        Select a Language
                      </Label>
                      <Dropdown
                        id="interpreterLanguage"
                        label=""
                        value={watchedValues.interpreterLanguage || ''}
                        onChange={(val: string) => setValue('interpreterLanguage', val)}
                        options={languageOptions}
                        placeholder="Select Language"
                        className="w-full"
                        icon={false}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Transportation Section */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black">Transportation</h3>
                  <ToggleSwitch
                    enabled={transportationEnabled}
                    onChange={value => handleToggleChange('transportation', value)}
                  />
                </div>

                {transportationEnabled && (
                  <div className="space-y-6">
                    {/* Address Lookup */}
                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress" className="text-sm text-gray-600">
                        Pick-Up Address Lookup*
                      </Label>
                      <div className="relative">
                        <Input
                          disabled={isSubmitting}
                          {...register('pickupAddress', {
                            required: transportationEnabled ? 'Pick-up address is required' : false,
                          })}
                          placeholder="150 John Street"
                          className="w-full pl-10"
                        />
                        <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                      {errors.pickupAddress && (
                        <p className="text-sm text-red-600">{errors.pickupAddress.message}</p>
                      )}
                    </div>

                    {/* Street / Apt / City */}
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="streetAddress" className="text-sm text-gray-600">
                          Street Address
                        </Label>
                        <Input
                          disabled={isSubmitting}
                          {...register('streetAddress')}
                          placeholder="50 Stephanie Street"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="aptUnitSuite" className="text-sm text-gray-600">
                          Apt / Unit / Suite
                        </Label>
                        <Input
                          disabled={isSubmitting}
                          {...register('aptUnitSuite')}
                          placeholder="402"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm text-gray-600">
                          City
                        </Label>
                        <Input
                          disabled={isSubmitting}
                          {...register('city')}
                          placeholder="Toronto"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Postal Code / Province */}
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm text-gray-600">
                          Postal Code
                        </Label>
                        <Input
                          disabled={isSubmitting}
                          {...register('postalCode')}
                          placeholder="M5V 3A8"
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
                          value={watchedValues.province || ''}
                          onChange={(val: string) => setValue('province', val)}
                          options={provinceOptions}
                          placeholder="Select Province"
                          className="w-full"
                          icon={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chaperone Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black">Chaperone</h3>
                  <ToggleSwitch
                    enabled={chaperoneEnabled}
                    onChange={value => handleToggleChange('chaperone', value)}
                  />
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black">Additional Notes</h3>
                  <ToggleSwitch
                    enabled={additionalNotesEnabled}
                    onChange={value => handleToggleChange('additionalNotes', value)}
                  />
                </div>

                {additionalNotesEnabled && (
                  <div className="space-y-2">
                    <textarea
                      {...register('additionalNotesText')}
                      placeholder="Type here"
                      className="min-h-[120px] w-full resize-none rounded-md border border-[#F2F5F6] bg-[#F2F5F6] px-3 py-2 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="mb-8">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreement"
                    {...register('agreement', { required: 'You must agree to the terms' })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#000080] focus:ring-[#000080]"
                  />
                  <label htmlFor="agreement" className="text-sm leading-5 text-gray-700">
                    By submitting this form, you agree that Thrive may use this information solely
                    for the purpose of scheduling your medical assessment.
                  </label>
                </div>
                {errors.agreement && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreement.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || !watchedValues.agreement}
                  className="flex cursor-pointer items-center space-x-2 rounded-full bg-[#000080] px-8 py-3 font-medium text-white transition-opacity hover:bg-[#000070] disabled:cursor-not-allowed disabled:opacity-50"
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
        </form>
      </div>
    </div>
  );
};

export default AddOnServices;
