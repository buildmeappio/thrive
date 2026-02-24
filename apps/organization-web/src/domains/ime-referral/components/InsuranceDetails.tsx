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
import { useEffect, useState, useMemo } from 'react';
import CustomDatePicker from '@/components/CustomDatePicker';
import GoogleMapsInput from '@/components/GoogleMapsInputRHF';
import PhoneInput from '@/components/PhoneNumber';
import { Dropdown } from '@/components/Dropdown';
import { provinceOptions } from '@/config/ProvinceOptions';
import { Printer } from 'lucide-react';
import { getCaseData } from '../actions';

type InsuranceProps = IMEReferralProps & {
  insuranceData?: Awaited<ReturnType<typeof getCaseData>>['result']['step2'];
  mode?: 'create' | 'edit';
};

const InsuranceDetails: React.FC<InsuranceProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  insuranceData,
  mode,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    control,
  } = useForm<InsuranceDetails>({
    resolver: zodResolver(InsuranceDetailsSchema),
    defaultValues: data.step2 || insuranceData || InsuranceDetailsInitialValues,
    mode: 'onSubmit',
  });

  const watchedValues = watch();

  // Check if all required fields are filled (not empty)
  // Validation errors will show when user clicks Continue
  const areAllRequiredFieldsFilled = useMemo(() => {
    const insuranceCompanyName = watchedValues.insuranceCompanyName?.trim() || '';
    const insuranceAdjusterContact = watchedValues.insuranceAdjusterContact?.trim() || '';
    const insurancePolicyNo = watchedValues.insurancePolicyNo?.trim() || '';
    const insuranceClaimNo = watchedValues.insuranceClaimNo?.trim() || '';
    const insuranceDateOfLoss = watchedValues.insuranceDateOfLoss?.trim() || '';
    const insurancePhone = watchedValues.insurancePhone?.trim() || '';
    const insuranceFaxNo = watchedValues.insuranceFaxNo?.trim() || '';
    const insuranceEmailAddress = watchedValues.insuranceEmailAddress?.trim() || '';
    const policyHolderFirstName = watchedValues.policyHolderFirstName?.trim() || '';
    const policyHolderLastName = watchedValues.policyHolderLastName?.trim() || '';

    return (
      insuranceCompanyName.length > 0 &&
      insuranceAdjusterContact.length > 0 &&
      insurancePolicyNo.length > 0 &&
      insuranceClaimNo.length > 0 &&
      insuranceDateOfLoss.length > 0 &&
      insurancePhone.length > 0 &&
      insuranceFaxNo.length > 0 &&
      insuranceEmailAddress.length > 0 &&
      policyHolderFirstName.length > 0 &&
      policyHolderLastName.length > 0
    );
  }, [
    watchedValues.insuranceCompanyName,
    watchedValues.insuranceAdjusterContact,
    watchedValues.insurancePolicyNo,
    watchedValues.insuranceClaimNo,
    watchedValues.insuranceDateOfLoss,
    watchedValues.insurancePhone,
    watchedValues.insuranceFaxNo,
    watchedValues.insuranceEmailAddress,
    watchedValues.policyHolderFirstName,
    watchedValues.policyHolderLastName,
  ]);

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
    setAttemptedSubmit(true);
    setData('step2', values);
    if (onNext) onNext();
  };

  const onError = () => {
    setAttemptedSubmit(true);
  };

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <h1 className="mb-6 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        {mode === 'edit' ? 'Edit Case Request' : 'New Case Request'}
      </h1>
      <ProgressIndicator mode={mode} currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[55px] md:py-8"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full max-w-full" noValidate>
          <div className="w-full max-w-full">
            <div className="w-full max-w-full space-y-8">
              <div className="w-full max-w-full px-4 md:px-0">
                {/* Insurance Details Section */}
                <h2 className="mb-6 text-[24px] font-semibold leading-[36.02px] tracking-[-0.02em] md:text-[36.02px]">
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
                      placeholder="Enter company name"
                      className={`w-full ${attemptedSubmit && errors.insuranceCompanyName ? 'border-red-500' : ''}`}
                    />
                    {attemptedSubmit && errors.insuranceCompanyName && (
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
                      placeholder="Enter adjuster/contact name"
                      className={`w-full ${attemptedSubmit && errors.insuranceAdjusterContact ? 'border-red-500' : ''}`}
                    />
                    {attemptedSubmit && errors.insuranceAdjusterContact && (
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
                      placeholder="Enter policy number"
                      className={`w-full ${attemptedSubmit && errors.insurancePolicyNo ? 'border-red-500' : ''}`}
                    />
                    {attemptedSubmit && errors.insurancePolicyNo && (
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
                      placeholder="Enter policy number"
                      className={`w-full ${attemptedSubmit && errors.insuranceClaimNo ? 'border-red-500' : ''}`}
                    />
                    {attemptedSubmit && errors.insuranceClaimNo && (
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
                    {attemptedSubmit && errors.insuranceDateOfLoss && (
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
                    placeholder="Enter address"
                    setValue={setValue}
                    trigger={trigger}
                    error={attemptedSubmit ? errors.insuranceAddressLookup : undefined}
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
                      placeholder="Enter street address"
                      className="w-full"
                    />
                    {attemptedSubmit && errors.insuranceStreetAddress && (
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
                      placeholder="Enter apt/unit/suite"
                      className="w-full"
                    />
                    {attemptedSubmit && errors.insuranceAptUnitSuite && (
                      <p className="text-sm text-red-500">{errors.insuranceAptUnitSuite.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="insurancePostalCode">Postal Code</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insurancePostalCode')}
                      placeholder="Enter postal code"
                      className="w-full"
                    />
                    {attemptedSubmit && errors.insurancePostalCode && (
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
                    {attemptedSubmit && errors.insuranceProvince && (
                      <p className="text-sm text-red-500">{errors.insuranceProvince.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceCity">City</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceCity')}
                      placeholder="Enter city"
                      className="w-full"
                    />
                    {attemptedSubmit && errors.insuranceCity && (
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
                      placeholder="Enter your phone number"
                      value={watch('insurancePhone') || ''}
                      onChange={e =>
                        setValue('insurancePhone', e.target.value, { shouldValidate: true })
                      }
                      className={`w-full ${attemptedSubmit && errors.insurancePhone ? 'border-red-500' : ''}`}
                    />
                    {attemptedSubmit && errors.insurancePhone && (
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
                      placeholder="Enter fax number"
                      className={`w-full ${attemptedSubmit && errors.insuranceFaxNo ? 'border-red-500' : ''}`}
                      icon={Printer}
                    />
                    {attemptedSubmit && errors.insuranceFaxNo && (
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
                      placeholder="Enter email address"
                      className={`w-full ${attemptedSubmit && errors.insuranceEmailAddress ? 'border-red-500' : ''}`}
                    />
                    {attemptedSubmit && errors.insuranceEmailAddress && (
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
                      placeholder="Enter first name"
                      className={`w-full ${attemptedSubmit && errors.policyHolderFirstName ? 'border-red-500' : ''} ${
                        policyHolderSameAsClaimant ? 'bg-gray-100' : ''
                      }`}
                    />
                    {attemptedSubmit && errors.policyHolderFirstName && (
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
                      placeholder="Enter last name"
                      className={`w-full ${attemptedSubmit && errors.policyHolderLastName ? 'border-red-500' : ''} ${
                        policyHolderSameAsClaimant ? 'bg-gray-100' : ''
                      }`}
                    />
                    {attemptedSubmit && errors.policyHolderLastName && (
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
              disabled={!areAllRequiredFieldsFilled}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceDetails;
