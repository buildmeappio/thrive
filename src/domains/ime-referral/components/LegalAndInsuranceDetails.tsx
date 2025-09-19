'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { provinceOptions } from '@/config/ProvinceOptions';
import {
  LegalInsuranceDetailsSchema,
  LegalInsuranceDetailsInitialValues,
  type LegalInsuranceDetails,
} from '../schemas/imeReferral';
import { useIMEReferralStore } from '@/store/useImeReferral';
import ContinueButton from '@/components/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import { type IMEReferralProps } from '@/types/imeReferralProps';
import BackButton from '@/components/BackButton';

const LegalAndInsuranceDetailsForm: React.FC<IMEReferralProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, setData } = useIMEReferralStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LegalInsuranceDetails>({
    resolver: zodResolver(LegalInsuranceDetailsSchema),
    defaultValues: data.step2 || LegalInsuranceDetailsInitialValues,
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<LegalInsuranceDetails> = values => {
    setData('step2', values);
    if (onNext) onNext();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[60px] md:py-12"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full">
            <div className="w-full max-w-full space-y-8">
              <div className="w-full max-w-full px-4 md:px-0">
                {/* Legal Representative Section */}
                <h2 className="mb-6 text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-2xl">
                  Legal Representative
                </h2>

                {/* Company Name and Contact Person */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legalCompanyName">
                      Company Name<span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="legalContactPerson">
                      Contact Person<span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="legalPhone">
                      Phone<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalPhone')}
                      placeholder="4444444444"
                      className="w-full"
                    />
                    {errors.legalPhone && (
                      <p className="text-sm text-red-500">{errors.legalPhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalFaxNo">
                      Fax No.<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalFaxNo')}
                      placeholder="4444444444"
                      className="w-full"
                    />
                    {errors.legalFaxNo && (
                      <p className="text-sm text-red-500">{errors.legalFaxNo.message}</p>
                    )}
                  </div>
                </div>

                {/* Legal Address Lookup */}
                <div className="mb-4 w-full max-w-full space-y-2">
                  <Label htmlFor="legalAddressLookup">
                    Address Lookup<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      disabled={isSubmitting}
                      {...register('legalAddressLookup')}
                      placeholder="150 John Street"
                      className="w-full pl-10"
                    />
                    <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.legalAddressLookup && (
                    <p className="text-sm text-red-500">{errors.legalAddressLookup.message}</p>
                  )}
                </div>

                {/* Legal Street Address, Apt/Unit/Suite, City */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="legalStreetAddress">
                      Street Address<span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="legalAptUnitSuite">
                      Apt / Unit / Suite<span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="legalCity">
                      City<span className="text-red-500">*</span>
                    </Label>
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

                {/* Legal Postal Code and Province */}
                <div className="mb-8 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="legalPostalCode">
                      Postal Code<span className="text-red-500">*</span>
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="legalProvinceState">
                      Province / State<span className="text-red-500">*</span>
                    </Label>
                    <Dropdown
                      id="legalProvinceState"
                      label=""
                      value={watchedValues.legalProvinceState ?? ''}
                      onChange={(val: string) => setValue('legalProvinceState', val)}
                      options={provinceOptions}
                      placeholder="Select"
                      className="w-full"
                    />
                    {errors.legalProvinceState && (
                      <p className="text-sm text-red-500">{errors.legalProvinceState.message}</p>
                    )}
                  </div>

                  <div></div>
                </div>

                {/* Insurance Details Section */}
                <h2 className="mb-6 text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-2xl">
                  Insurance Details
                </h2>

                {/* Insurance Company Name and Adjuster/Contact */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
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
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
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
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceDateOfLoss')}
                      placeholder="Select Date"
                      type="date"
                      className={`w-full ${errors.insuranceDateOfLoss ? 'border-red-500' : ''}`}
                    />
                    {errors.insuranceDateOfLoss && (
                      <p className="text-sm text-red-500">{errors.insuranceDateOfLoss.message}</p>
                    )}
                  </div>
                </div>

                {/* Insurance Address Lookup */}
                <div className="mb-4 w-full max-w-full space-y-2">
                  <Label htmlFor="insuranceAddressLookup">
                    Address Lookup<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceAddressLookup')}
                      placeholder="150 John Street"
                      className="w-full pl-10"
                    />
                    <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.insuranceAddressLookup && (
                    <p className="text-sm text-red-500">{errors.insuranceAddressLookup.message}</p>
                  )}
                </div>

                {/* Insurance Street Address, Apt/Unit/Suite, City */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceStreetAddress">
                      Street Address<span className="text-red-500">*</span>
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="insuranceAptUnitSuite">
                      Apt / Unit / Suite<span className="text-red-500">*</span>
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="insuranceCity">
                      City<span className="text-red-500">*</span>
                    </Label>
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
                    <Input
                      disabled={isSubmitting}
                      {...register('insurancePhone')}
                      placeholder="4444444444"
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
                    <Input
                      disabled={isSubmitting}
                      {...register('insuranceFaxNo')}
                      placeholder="4444444444"
                      className={`w-full ${errors.insuranceFaxNo ? 'border-red-500' : ''}`}
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
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      disabled={isSubmitting}
                      {...register('policyHolderFirstName')}
                      placeholder="John"
                      className={`w-full ${errors.policyHolderFirstName ? 'border-red-500' : ''}`}
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
                      disabled={isSubmitting}
                      {...register('policyHolderLastName')}
                      placeholder="Doe"
                      className={`w-full ${errors.policyHolderLastName ? 'border-red-500' : ''}`}
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
          <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
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

export default LegalAndInsuranceDetailsForm;
