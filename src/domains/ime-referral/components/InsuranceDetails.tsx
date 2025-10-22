'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  InsuranceDetailsSchema,
  InsuranceDetailsInitialValues,
  type InsuranceDetails,
} from '../schemas/imeReferral';
import { useIMEReferralStore } from '@/store/useImeReferral';
import ContinueButton from '@/components/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import { type IMEReferralProps } from '@/types/imeReferralProps';
import BackButton from '@/components/BackButton';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import CustomDatePicker from '@/components/CustomDatePicker';
import GoogleMapsInput from '@/components/GoogleMapsInputRHF';
import PhoneInput from '@/components/PhoneNumber';
import { Dropdown } from '@/components/Dropdown';
import { provinceOptions } from '@/config/ProvinceOptions';
import { Printer } from 'lucide-react';
import { getCaseData } from '../actions';

type InsuranceProps = IMEReferralProps & {
  insuranceData?: Awaited<ReturnType<typeof getCaseData>>['result']['step2'];
};

const InsuranceDetails: React.FC<InsuranceProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  insuranceData,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<InsuranceDetails>({
    resolver: zodResolver(InsuranceDetailsSchema),
    defaultValues: data.step2 || insuranceData || InsuranceDetailsInitialValues,
  });

  const policyHolderSameAsClaimant = watch('policyHolderSameAsClaimant');

  useEffect(() => {
    if (policyHolderSameAsClaimant && data.step1) {
      setValue('policyHolderFirstName', data.step1.firstName || '');
      setValue('policyHolderLastName', data.step1.lastName || '');
    } else if (!policyHolderSameAsClaimant) {
      setValue('policyHolderFirstName', '');
      setValue('policyHolderLastName', '');
    }
  }, [policyHolderSameAsClaimant, data.step1, setValue]);

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
        province = component.short_name; // Use short_name for province code (e.g., "ON", "BC")
      }
    });

    // Construct street address
    const streetAddress = `${streetNumber} ${route}`.trim();

    // Update form fields
    if (streetAddress) {
      setValue('insuranceStreetAddress', streetAddress, { shouldValidate: true });
    }
    if (city) {
      setValue('insuranceCity', city, { shouldValidate: true });
    }
    if (postalCode) {
      setValue('insurancePostalCode', postalCode, { shouldValidate: true });
    }
    if (province) {
      setValue('insuranceProvince', province, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<InsuranceDetails> = values => {
    setData('step2', values);
    if (onNext) onNext();
  };

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <h1 className="mb-6 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        New Case Request
      </h1>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[55px] md:py-8"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full">
            <div className="w-full max-w-full space-y-8">
              <div className="w-full max-w-full px-4 md:px-0">
                {/* Insurance Details Section */}
                <h2 className="mb-6 text-[24px] leading-[36.02px] font-semibold tracking-[-0.02em] md:text-[36.02px]">
                  Insurance Details
                </h2>

                {/* Insurance Company Name and Adjuster/Contact */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceCompanyName">
                      Company Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceCompanyName')}
                      placeholder="WSH"
                      className={`w-full ${errors.insuranceCompanyName ? 'border-red-500' : ''}`}
                    />
                    {errors.insuranceCompanyName && (
                      <p className="text-sm text-red-500">{errors.insuranceCompanyName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceAdjusterContact">
                      Adjuster/Contact<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceAdjusterContact')}
                      placeholder="John Doe"
                      className={`w-full ${errors.insuranceAdjusterContact ? 'border-red-500' : ''}`}
                    />
                    {errors.insuranceAdjusterContact && (
                      <p className="text-sm text-red-500">
                        {errors.insuranceAdjusterContact.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Policy No, Claim No, Date of Loss */}
                <div className="-mb-2 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="insurancePolicyNo">
                      Policy No.<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insurancePolicyNo')}
                      placeholder="12345"
                      className={`w-full ${errors.insurancePolicyNo ? 'border-red-500' : ''}`}
                    />
                    {errors.insurancePolicyNo && (
                      <p className="text-sm text-red-500">{errors.insurancePolicyNo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceClaimNo">
                      Claim No.<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceClaimNo')}
                      placeholder="12345"
                      className={`w-full ${errors.insuranceClaimNo ? 'border-red-500' : ''}`}
                    />
                    {errors.insuranceClaimNo && (
                      <p className="text-sm text-red-500">{errors.insuranceClaimNo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceDateOfLoss">
                      Date of Loss<span className="text-red-500">*</span>
                    </Label>
                    <CustomDatePicker
                      selectedDate={
                        watch('insuranceDateOfLoss') ? new Date(watch('insuranceDateOfLoss')) : null
                      }
                      datePickLoading={false}
                      onDateChange={date => {
                        const dateValue = date ? date.toISOString().split('T')[0] : '';
                        setValue('insuranceDateOfLoss', dateValue, { shouldValidate: true });
                      }}
                      dateRestriction="past"
                    />
                    {errors.insuranceDateOfLoss && (
                      <p className="text-sm text-red-500">{errors.insuranceDateOfLoss.message}</p>
                    )}
                  </div>
                </div>

                {/* Insurance Address Lookup - NOW USING GoogleMapsInput */}
                <div className="mb-6 w-full max-w-full">
                  <GoogleMapsInput
                    name="insuranceAddressLookup"
                    value={watch('insuranceAddressLookup')}
                    label="Address Lookup"
                    placeholder="150 John Street, Toronto"
                    setValue={setValue}
                    trigger={trigger}
                    error={errors.insuranceAddressLookup}
                    onPlaceSelect={handlePlaceSelect}
                    className="space-y-2"
                  />
                </div>

                {/* Insurance Street Address */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceStreetAddress">Street Address</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceStreetAddress')}
                      placeholder="50 Stephanie Street"
                      className="w-full"
                    />
                    {errors.insuranceStreetAddress && (
                      <p className="text-sm text-red-500">
                        {errors.insuranceStreetAddress.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Apt/Unit/Suite, Postal Code, Province, City */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="insuranceAptUnitSuite">Apt / Unit / Suite</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceAptUnitSuite')}
                      placeholder="402"
                      className="w-full"
                    />
                    {errors.insuranceAptUnitSuite && (
                      <p className="text-sm text-red-500">{errors.insuranceAptUnitSuite.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="insurancePostalCode">Postal Code</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insurancePostalCode')}
                      placeholder="A1A 1A1"
                      className="w-full"
                    />
                    {errors.insurancePostalCode && (
                      <p className="text-sm text-red-500">{errors.insurancePostalCode.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvince">Province / State</Label>
                    <Dropdown
                      id="insuranceProvince"
                      label=""
                      value={watch('insuranceProvince') ?? ''}
                      onChange={(val: string) =>
                        setValue('insuranceProvince', val, { shouldValidate: true })
                      }
                      options={provinceOptions}
                      placeholder="Select"
                    />
                    {errors.insuranceProvince && (
                      <p className="text-sm text-red-500">{errors.insuranceProvince.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceCity">City</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceCity')}
                      placeholder="Toronto"
                      className="w-full"
                    />
                    {errors.insuranceCity && (
                      <p className="text-sm text-red-500">{errors.insuranceCity.message}</p>
                    )}
                  </div>
                </div>

                {/* Insurance Phone, Fax No, Email */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="insurancePhone">
                      Phone<span className="text-red-500">*</span>
                    </Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="insurancePhone"
                      value={watch('insurancePhone') || ''}
                      onChange={e =>
                        setValue('insurancePhone', e.target.value, { shouldValidate: true })
                      }
                      className={`w-full ${errors.insurancePhone ? 'border-red-500' : ''}`}
                    />
                    {errors.insurancePhone && (
                      <p className="text-sm text-red-500">{errors.insurancePhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceFaxNo">
                      Fax No.<span className="text-red-500">*</span>
                    </Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="insuranceFaxNo"
                      value={watch('insuranceFaxNo') || ''}
                      onChange={e =>
                        setValue('insuranceFaxNo', e.target.value, { shouldValidate: true })
                      }
                      className={`w-full ${errors.insuranceFaxNo ? 'border-red-500' : ''}`}
                      icon={Printer}
                    />
                    {errors.insuranceFaxNo && (
                      <p className="text-sm text-red-500">{errors.insuranceFaxNo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceEmailAddress">
                      Email Address<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceEmailAddress')}
                      type="email"
                      placeholder="johndoe20@gmail.com"
                      className={`w-full ${errors.insuranceEmailAddress ? 'border-red-500' : ''}`}
                    />
                    {errors.insuranceEmailAddress && (
                      <p className="text-sm text-red-500">{errors.insuranceEmailAddress.message}</p>
                    )}
                  </div>
                </div>

                {/* Checkbox */}
                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    id="policyHolderSameAsClaimant"
                    {...register('policyHolderSameAsClaimant')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 [color-scheme:light] focus:ring-blue-500"
                  />
                  <Label htmlFor="policyHolderSameAsClaimant" className="ml-2 text-sm">
                    Policy Holder is same as claimant
                  </Label>
                </div>

                {/* Policy Holder First Name and Last Name */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="policyHolderFirstName">
                      First Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting || policyHolderSameAsClaimant}
                      {...register('policyHolderFirstName')}
                      placeholder="John"
                      className={`w-full ${errors.policyHolderFirstName ? 'border-red-500' : ''} ${
                        policyHolderSameAsClaimant ? 'bg-gray-100' : ''
                      }`}
                    />
                    {errors.policyHolderFirstName && (
                      <p className="text-sm text-red-500">{errors.policyHolderFirstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policyHolderLastName">
                      Last Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting || policyHolderSameAsClaimant}
                      {...register('policyHolderLastName')}
                      placeholder="Doe"
                      className={`w-full ${errors.policyHolderLastName ? 'border-red-500' : ''} ${
                        policyHolderSameAsClaimant ? 'bg-gray-100' : ''
                      }`}
                    />
                    {errors.policyHolderLastName && (
                      <p className="text-sm text-red-500">{errors.policyHolderLastName.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Buttons */}
          <div className="mb-8 flex flex-row justify-between gap-4 px-4 md:mb-0 md:px-0">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
              isSubmitting={false}
            />
            <ContinueButton
              isSubmitting={isSubmitting}
              isLastStep={currentStep === totalSteps}
              color="#000080"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceDetails;
