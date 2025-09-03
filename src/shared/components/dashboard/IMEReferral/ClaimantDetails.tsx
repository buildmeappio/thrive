'use client';

import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/shared/components/ui/input';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { CalendarIcon, MapPin } from 'lucide-react';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import ProgressIndicator from './ProgressIndicator';
import { provinceOptions } from '@/shared/config/ProvinceOptions';
import { genderOptions } from '@/shared/config/GenderOptions';
import { 
  ClaimantDetailsSchema, 
  ClaimantDetailsInitialValues,
  type ClaimantDetails 
} from '@/shared/validation/imeReferral/imeReferralValidation';

type ClaimantDetailsFormProps = {
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
};

const ClaimantDetailsForm: React.FC<ClaimantDetailsFormProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors }
  } = useForm<ClaimantDetails>({
    resolver: zodResolver(ClaimantDetailsSchema),
    defaultValues: ClaimantDetailsInitialValues
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<ClaimantDetails> = async (values) => {
    console.log('Form Submitted:', values);
    if (onNext) onNext();
  };

  return (
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="mt-4 w-full rounded-[20px] bg-white py-12 md:rounded-[30px] md:px-[75px]"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="md:space-y-12">
            <div className="w-full px-4 md:px-0">
              <h2 className="text-[36.02px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000]">
                Claimant Details
              </h2>

              {/* Top Row */}
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('firstName')}
                    placeholder="John"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('lastName')}
                    placeholder="Doe"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">
                    Date of Birth<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('dob')}
                      placeholder="DD/MM/YYYY"
                      className={`pr-10 ${errors.dob ? 'border-red-500' : ''}`}
                    />
                    <CalendarIcon className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.dob && (
                    <p className="text-sm text-red-500">{errors.dob.message}</p>
                  )}
                </div>
              </div>

              {/* Second Row */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender<span className="text-red-500">*</span>
                  </Label>
                  <Dropdown
                    id="gender"
                    label=""
                    value={watchedValues.gender}
                    onChange={(val: string) => setValue('gender', val)}
                    options={genderOptions}
                    placeholder="Select gender"
                    className={errors.gender ? 'border-red-500' : ''}
                  />
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('phone')}
                    placeholder="123456789"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="johndoe20@gmail.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Address Lookup */}
              <div className="mt-6 space-y-2">
                <Label htmlFor="addressLookup">
                  Address Lookup<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    {...register('addressLookup')}
                    placeholder="150 John Street"
                    className={`pl-10 ${errors.addressLookup ? 'border-red-500' : ''}`}
                  />
                  <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.addressLookup && (
                  <p className="text-sm text-red-500">{errors.addressLookup.message}</p>
                )}
              </div>

              {/* Street / Apt / City */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    {...register('street')}
                    placeholder="50 Stephanie Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apt">Apt / Unit / Suite</Label>
                  <Input
                    {...register('apt')}
                    placeholder="402"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    {...register('city')}
                    placeholder="Toronto"
                  />
                </div>
              </div>

              {/* Postal Code / Province */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    {...register('postalCode')}
                    placeholder="7200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province / State</Label>
                  <Dropdown
                    id="province"
                    label=""
                    value={watchedValues.province ?? ''}
                    onChange={(val: string) => setValue('province', val)}
                    options={provinceOptions}
                    placeholder="Select province"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1}
                borderColor="#000080"
                iconColor="#000080"
              />
              <ContinueButton isLastStep={currentStep === totalSteps} color="#000080" />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ClaimantDetailsForm;