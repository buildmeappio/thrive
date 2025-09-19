'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { provinceOptions } from '@/config/ProvinceOptions';
import { genderOptions } from '@/config/GenderOptions';
import {
  ClaimantDetailsSchema,
  ClaimantDetailsInitialValues,
  type ClaimantDetails,
} from '../schemas/imeReferral';
import { useIMEReferralStore } from '@/store/useImeReferral';
import ContinueButton from '@/components/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import { type IMEReferralProps } from '@/types/imeReferralProps';
import { Textarea } from '@/components/ui/textarea';

const ClaimantDetailsForm: React.FC<IMEReferralProps> = ({ onNext, currentStep, totalSteps }) => {
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
        className="w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[60px] md:py-12"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full space-y-6">
            <div className="w-full max-w-full px-4 md:px-0">
              <h2 className="mb-6 text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-2xl">
                Claimant Details
              </h2>

              {/* First Row: First Name, Last Name, Date of Birth */}
              <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-2">
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

                <div className="space-y-2 md:col-span-2">
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

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('dateOfBirth')}
                    placeholder="MM/DD/YYYY"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              {/* Second Row: Gender, Phone, Email */}
              <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="gender">
                    Gender<span className="text-red-500">*</span>
                  </Label>
                  <Dropdown
                    id="gender"
                    label=""
                    value={watchedValues.gender || ''}
                    onChange={(val: string) => setValue('gender', val)}
                    options={genderOptions}
                    placeholder="Select"
                    className="w-full"
                    icon={false}
                  />
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber">
                    Phone No.<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('phoneNumber')}
                    placeholder="444444444"
                    className={`w-full ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emailAddress">
                    Email Address<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('emailAddress')}
                    type="email"
                    placeholder="johndoe20@gmail.com"
                    className={`w-full ${errors.emailAddress ? 'border-red-500' : ''}`}
                  />
                  {errors.emailAddress && (
                    <p className="text-sm text-red-500">{errors.emailAddress.message}</p>
                  )}
                </div>
              </div>

              {/* Address Lookup */}
              <div className="mb-4 w-full max-w-full space-y-2">
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

              {/* Third Row: Street Address, Apt/Unit/Suite, City */}
              <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="street">
                    Street Address<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('street')}
                    placeholder="50 Stephanie Street"
                    className="w-full"
                  />
                  {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="suite">
                    Apt / Unit / Suite<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('suite')}
                    placeholder="402"
                    className="w-full"
                  />
                  {errors.suite && <p className="text-sm text-red-500">{errors.suite.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="city">
                    City<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('city')}
                    placeholder="Toronto"
                    className="w-full"
                  />
                  {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                </div>
              </div>

              {/* Fourth Row: Postal Code, Province */}
              <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="province">
                    Province / State<span className="text-red-500">*</span>
                  </Label>
                  <Dropdown
                    id="province"
                    label=""
                    value={watchedValues.province ?? ''}
                    onChange={(val: string) => setValue('province', val)}
                    options={provinceOptions}
                    placeholder="Select"
                    className="w-full"
                  />
                  {errors.province && (
                    <p className="text-sm text-red-500">{errors.province.message}</p>
                  )}
                </div>
                <div></div>
              </div>

              {/* Family Doctor Section */}
              <div className="w-full max-w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relatedCasesDetails">
                    Related Cases Details<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    {...register('relatedCasesDetails')}
                    placeholder="Type here"
                    className={`mt-2 min-h-[100px] w-full resize-none ${errors.relatedCasesDetails ? 'border-red-500' : ''}`}
                  />
                  {errors.relatedCasesDetails && (
                    <p className="text-sm text-red-500">{errors.relatedCasesDetails.message}</p>
                  )}
                </div>
                {/* Family Doctor Address and Email */}
                <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorName">
                      Family Doctor<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('familyDoctorName')}
                      placeholder="Dr. John Doe"
                      className="w-full"
                    />
                    {errors.familyDoctorName && (
                      <p className="text-sm text-red-500">{errors.familyDoctorName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorEmail">
                      Email Address<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('familyDoctorEmail')}
                      type="email"
                      placeholder="johndoe20@gmail.com"
                      className="w-full"
                    />
                    {errors.familyDoctorEmail && (
                      <p className="text-sm text-red-500">{errors.familyDoctorEmail.message}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Fax */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorPhone">
                      Phone No.<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('familyDoctorPhone')}
                      placeholder="4444444444"
                      className="w-full"
                    />
                    {errors.familyDoctorPhone && (
                      <p className="text-sm text-red-500">{errors.familyDoctorPhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorFax">
                      Fax No.<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('familyDoctorFax')}
                      placeholder="4444444444"
                      className="w-full"
                    />
                    {errors.familyDoctorFax && (
                      <p className="text-sm text-red-500">{errors.familyDoctorFax.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between px-4 md:px-0">
              <div></div>

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
