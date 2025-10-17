'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { provinceOptions } from '@/config/ProvinceOptions';
import {
  LegalDetailsSchema,
  LegalDetailsInitialValues,
  type LegalDetails,
} from '../schemas/imeReferral';
import { useIMEReferralStore } from '@/store/useImeReferral';
import ContinueButton from '@/components/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import { type IMEReferralProps } from '@/types/imeReferralProps';
import BackButton from '@/components/BackButton';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui';
import GoogleMapsInput from '@/components/GoogleMapsInputRHF';
import PhoneInput from '@/components/PhoneNumber';

const LegalRepresentativeComponent: React.FC<IMEReferralProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LegalDetails>({
    resolver: zodResolver(LegalDetailsSchema),
    defaultValues: data.step3 || LegalDetailsInitialValues,
  });

  const watchedValues = watch();

  const handlePlaceSelect = (placeData: any) => {
    // Parse address components and populate fields
    const components = placeData.components;

    let streetNumber = '';
    let route = '';
    let city = '';
    let postalCode = '';
    let province = '';

    components?.forEach((component: any) => {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        route = component.long_name;
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        province = component.short_name; // e.g., "ON" for Ontario
      }
    });

    // Construct street address
    const streetAddress = `${streetNumber} ${route}`.trim();

    // Update form fields
    if (streetAddress) {
      setValue('legalStreetAddress', streetAddress, { shouldValidate: true });
    }
    if (city) {
      setValue('legalCity', city, { shouldValidate: true });
    }
    if (postalCode) {
      setValue('legalPostalCode', postalCode, { shouldValidate: true });
    }
    if (province) {
      setValue('legalProvinceState', province, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<LegalDetails> = values => {
    setData('step3', values);
    if (onNext) onNext();
  };

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <h1 className="mb-4 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        New Case Request
      </h1>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[60px] md:py-8"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full">
            <div className="w-full max-w-full space-y-8">
              <div className="w-full max-w-full px-4 md:px-0">
                {/* Legal Representative Section */}
                <h2 className="mb-6 text-[24px] leading-[36.02px] font-semibold tracking-[-0.02em] md:text-[36.02px]">
                  Legal Representative
                </h2>

                {/* Company Name and Contact Person */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legalCompanyName">Company Name</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalCompanyName')}
                      placeholder="WSH"
                      className="w-full"
                    />
                    {errors.legalCompanyName && (
                      <p className="text-sm text-red-500">{errors.legalCompanyName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalContactPerson">Contact Person</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalContactPerson')}
                      placeholder="John Doe"
                      className="w-full"
                    />
                    {errors.legalContactPerson && (
                      <p className="text-sm text-red-500">{errors.legalContactPerson.message}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Fax */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legalPhone">Phone</Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="legalPhone"
                      value={watch('legalPhone') || ''}
                      onChange={e =>
                        setValue('legalPhone', e.target.value, { shouldValidate: true })
                      }
                      className="w-full"
                    />
                    {errors.legalPhone && (
                      <p className="text-sm text-red-500">{errors.legalPhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalFaxNo">Fax No.</Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="legalFaxNo"
                      value={watch('legalFaxNo') || ''}
                      onChange={e =>
                        setValue('legalFaxNo', e.target.value, { shouldValidate: true })
                      }
                      className="w-full"
                    />
                    {errors.legalFaxNo && (
                      <p className="text-sm text-red-500">{errors.legalFaxNo.message}</p>
                    )}
                  </div>
                </div>

                {/* Legal Address Lookup - NOW USING GoogleMapsInput */}
                <div className="mb-4 w-full max-w-full">
                  <GoogleMapsInput
                    name="legalAddressLookup"
                    value={watch('legalAddressLookup')}
                    label="Address Lookup"
                    placeholder="150 John Street, Toronto"
                    setValue={setValue}
                    trigger={trigger}
                    error={errors.legalAddressLookup}
                    onPlaceSelect={handlePlaceSelect}
                    className="space-y-2"
                  />
                </div>

                {/* Legal Street Address, Apt/Unit/Suite, Postal Code */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="legalStreetAddress">Street Address</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalStreetAddress')}
                      placeholder="50 Stephanie Street"
                      className="w-full"
                    />
                    {errors.legalStreetAddress && (
                      <p className="text-sm text-red-500">{errors.legalStreetAddress.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalAptUnitSuite">Apt / Unit / Suite</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalAptUnitSuite')}
                      placeholder="402"
                      className="w-full"
                    />
                    {errors.legalAptUnitSuite && (
                      <p className="text-sm text-red-500">{errors.legalAptUnitSuite.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalPostalCode">Postal Code</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalPostalCode')}
                      placeholder="A1A 1A1"
                      className="w-full"
                    />
                    {errors.legalPostalCode && (
                      <p className="text-sm text-red-500">{errors.legalPostalCode.message}</p>
                    )}
                  </div>
                </div>

                {/* Legal Province and City */}
                <div className="mb-8 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legalProvinceState">Province / State</Label>
                    <Dropdown
                      id="legalProvinceState"
                      label=""
                      value={watchedValues.legalProvinceState ?? ''}
                      onChange={(val: string) => setValue('legalProvinceState', val)}
                      options={provinceOptions}
                      placeholder="Select"
                    />
                    {errors.legalProvinceState && (
                      <p className="text-sm text-red-500">{errors.legalProvinceState.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalCity">City</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalCity')}
                      placeholder="Toronto"
                      className="w-full"
                    />
                    {errors.legalCity && (
                      <p className="text-sm text-red-500">{errors.legalCity.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Buttons */}
          <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
              isSubmitting={false}
            />
            <div className="flex gap-4">
              <Button
                className="h-[45px] w-[136px] rounded-full bg-blue-500 bg-gradient-to-l from-[#01F4C8] to-[#00A8FF] text-white"
                onClick={onNext}
              >
                Skip
                {isSubmitting ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
                ) : (
                  <ArrowRight className="cup ml-2 h-4 w-4 text-white transition-all duration-300 ease-in-out" />
                )}
              </Button>
              <ContinueButton
                isSubmitting={isSubmitting}
                isLastStep={currentStep === totalSteps}
                color="#000080"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LegalRepresentativeComponent;
