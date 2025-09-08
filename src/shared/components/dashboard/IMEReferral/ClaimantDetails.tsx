'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/shared/components/ui/input';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { MapPin } from 'lucide-react';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import ProgressIndicator from './ProgressIndicator';
import { provinceOptions } from '@/shared/config/ProvinceOptions';
import { genderOptions } from '@/shared/config/GenderOptions';
import {
  ClaimantDetailsSchema,
  ClaimantDetailsInitialValues,
  type ClaimantDetails,
} from '@/shared/validation/imeReferral/imeReferralValidation';
import { type IMEReferralFormProps } from '@/shared/types/imeReferral/imeReferralStepsProps';
import { useIMEReferralStore } from '@/store/useIMEReferralStore';

const ClaimantDetailsForm: React.FC<IMEReferralFormProps> = ({
  onNext,
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
  } = useForm<ClaimantDetails>({
    resolver: zodResolver(ClaimantDetailsSchema),
    defaultValues: data.step1 || ClaimantDetailsInitialValues,
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<ClaimantDetails> = values => {
    setData('step1', values);
    if (onNext) onNext();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[75px] md:py-12"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full md:space-y-12">
            <div className="w-full max-w-full px-4 md:px-0">
              <h2 className="text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-[36.02px]">
                Claimant Details
              </h2>

              {/* Top Row */}
              <div className="mt-4 grid w-full max-w-full grid-cols-1 gap-6 md:grid-cols-5">
                <div className="min-w-0 space-y-2 md:col-span-2">
                  <Label htmlFor="firstName">
                    First Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('firstName')}
                    placeholder="John"
                    className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="min-w-0 space-y-2 md:col-span-2">
                  <Label htmlFor="lastName">
                    Last Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('lastName')}
                    placeholder="Doe"
                    className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="min-w-0 space-y-2 md:col-span-1">
                  <Label htmlFor="dob">
                    Date of Birth<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      disabled={isSubmitting}
                      {...register('dob')}
                      placeholder="MM/DD/YYYY"
                      type="date"
                      className={`w-full pr-10 ${errors.dob ? 'border-red-500' : ''}`}
                      style={{ appearance: 'none' }}
                    />
                  </div>
                  {errors.dob && <p className="text-sm text-red-500">{errors.dob.message}</p>}
                </div>
              </div>

              {/* Second Row */}
              <div className="mt-6 grid w-full max-w-full grid-cols-1 gap-6 md:grid-cols-5">
                {/* Gender (smaller) */}
                <div className="min-w-0 space-y-2 md:col-span-1">
                  <Label htmlFor="gender">
                    Gender<span className="text-red-500">*</span>
                  </Label>
                  <Dropdown
                    id="gender"
                    label=""
                    value={watchedValues.gender || ''}
                    onChange={(val: string) => setValue('gender', val)}
                    options={genderOptions}
                    placeholder="Select gender"
                    className={`w-full ${errors.gender ? 'border-red-500' : ''}`}
                    icon={false}
                  />
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                </div>

                {/* Phone (bigger) */}
                <div className="min-w-0 space-y-2 md:col-span-2">
                  <Label htmlFor="phone">
                    Phone<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('phone')}
                    placeholder="4444444444"
                    className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                {/* Email (bigger) */}
                <div className="min-w-0 space-y-2 md:col-span-2">
                  <Label htmlFor="email">
                    Email Address<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('email')}
                    type="email"
                    placeholder="johndoe20@gmail.com"
                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              {/* Address Lookup */}
              <div className="mt-6 w-full max-w-full space-y-2">
                <Label htmlFor="addressLookup">
                  Address Lookup<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    disabled={isSubmitting}
                    {...register('addressLookup')}
                    placeholder="150 John Street"
                    className={`w-full pl-10 ${errors.addressLookup ? 'border-red-500' : ''}`}
                  />
                  <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.addressLookup && (
                  <p className="text-sm text-red-500">{errors.addressLookup.message}</p>
                )}
              </div>

              {/* Street / Apt / City */}
              <div className="mt-6 grid w-full max-w-full grid-cols-1 gap-6 md:grid-cols-5">
                {/* Street (wider) */}
                <div className="min-w-0 space-y-2 md:col-span-3">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('street')}
                    placeholder="50 Stephanie Street"
                    className="w-full"
                  />
                  {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
                </div>

                {/* Apt / Unit / Suite (smaller, equal to City) */}
                <div className="min-w-0 space-y-2 md:col-span-1">
                  <Label htmlFor="apt">Apt / Unit / Suite</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('apt')}
                    placeholder="402"
                    className="w-full"
                  />
                </div>

                {/* City (smaller, equal to Apt) */}
                <div className="min-w-0 space-y-2 md:col-span-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('city')}
                    placeholder="Toronto"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Postal Code / Province */}
              <div className="mt-6 grid w-full max-w-full grid-cols-1 gap-6 md:grid-cols-5">
                {/* Postal Code */}
                <div className="min-w-0 space-y-2 md:col-span-1">
                  <Label htmlFor="postalCode">
                    Postal Code<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('postalCode')}
                    placeholder="A1A 1A1"
                    className="w-full"
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-red-500">{errors.postalCode.message}</p>
                  )}
                </div>

                {/* Province / State */}
                <div className="min-w-0 space-y-2 md:col-span-1">
                  <Label htmlFor="province">Province / State</Label>
                  <Dropdown
                    id="province"
                    label=""
                    value={watchedValues.province ?? ''}
                    onChange={(val: string) => setValue('province', val)}
                    options={provinceOptions}
                    placeholder="Select province"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex justify-end px-4 md:mt-0 md:mb-0 md:px-0">
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

export default ClaimantDetailsForm;
