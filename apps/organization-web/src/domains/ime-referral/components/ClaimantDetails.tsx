'use client';

import { useMemo, useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import CustomDatePicker from '@/components/CustomDatePicker';
import GoogleMapsInput from '@/components/GoogleMapsInputRHF';
import PhoneInput from '@/components/PhoneNumber';
import type { OrganizationTypeOption } from '@/domains/auth/components/Register/OrganizationInfo';
import { Printer } from 'lucide-react';
import { getCaseData } from '../actions';

type CLaimTypeProps = IMEReferralProps & {
  claimTypes: OrganizationTypeOption[];
  claimantData?: Awaited<ReturnType<typeof getCaseData>>['result']['step1'];
  mode?: 'create' | 'edit';
};

const ClaimantDetailsForm: React.FC<CLaimTypeProps> = ({
  onNext,
  currentStep,
  totalSteps,
  claimTypes: claimTypeOptions,
  claimantData,
  mode,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ClaimantDetails>({
    resolver: zodResolver(ClaimantDetailsSchema),
    defaultValues: data.step1 || claimantData || ClaimantDetailsInitialValues,
    mode: 'onSubmit',
  });

  const watchedValues = watch();

  // Check if all required fields are filled (not empty)
  // Validation errors will show when user clicks Continue
  const areAllRequiredFieldsFilled = useMemo(() => {
    const claimType = watchedValues.claimType?.trim() || '';
    const firstName = watchedValues.firstName?.trim() || '';
    const lastName = watchedValues.lastName?.trim() || '';
    const addressLookup = watchedValues.addressLookup?.trim() || '';

    return (
      claimType.length > 0 &&
      firstName.length > 0 &&
      lastName.length > 0 &&
      addressLookup.length > 0
    );
  }, [
    watchedValues.claimType,
    watchedValues.firstName,
    watchedValues.lastName,
    watchedValues.addressLookup,
  ]);

  const onSubmit: SubmitHandler<ClaimantDetails> = async values => {
    setAttemptedSubmit(true);
    setData('step1', values);

    if (onNext) {
      onNext();
    }
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
          <div className="w-full max-w-full space-y-6">
            <div className="w-full max-w-full px-4 md:px-0">
              <h2 className="mb-6 text-[24px] font-semibold leading-[36.02px] tracking-[-0.02em] md:text-[36.02px]">
                Claimant Details
              </h2>
              <div className="mb-6">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="claimType">
                    Type of Claim<span className="text-red-500">*</span>
                  </Label>
                  <Dropdown
                    id="claimType"
                    label=""
                    value={watchedValues.claimType || ''}
                    onChange={(val: string) => setValue('claimType', val)}
                    options={claimTypeOptions}
                    placeholder="Select type of claim"
                    icon={false}
                  />
                  {attemptedSubmit && errors.claimType && (
                    <p className="text-sm text-red-500">{errors.claimType.message}</p>
                  )}
                </div>
              </div>

              {/* First Row: First Name, Last Name, Date of Birth */}
              <div className="grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="firstName">
                    First Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('firstName')}
                    placeholder="Enter your first name"
                    className={`w-full ${attemptedSubmit && errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {attemptedSubmit && errors.firstName && (
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
                    placeholder="Enter your last name"
                    className={`w-full ${attemptedSubmit && errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {attemptedSubmit && errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <CustomDatePicker
                      selectedDate={
                        watchedValues.dateOfBirth ? new Date(watchedValues.dateOfBirth) : null
                      }
                      datePickLoading={false}
                      onDateChange={date =>
                        setValue('dateOfBirth', date ? date.toISOString().split('T')[0] : '')
                      }
                      dateRestriction="past"
                      minDate={new Date(new Date().getFullYear() - 100, 0, 1)}
                    />
                    {attemptedSubmit && errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Second Row: Gender, Phone, Email */}
              <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="gender">Gender</Label>
                  <Dropdown
                    id="gender"
                    label=""
                    value={watchedValues.gender || ''}
                    onChange={(val: string) => setValue('gender', val)}
                    options={genderOptions}
                    placeholder="Select"
                    icon={false}
                  />
                  {attemptedSubmit && errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber">Phone No.</Label>
                  <PhoneInput
                    disabled={isSubmitting}
                    name="phoneNumber"
                    value={watch('phoneNumber') || ''}
                    onChange={e =>
                      setValue('phoneNumber', e.target.value, { shouldValidate: true })
                    }
                    placeholder="Enter your phone number"
                    className={`w-full ${attemptedSubmit && errors.phoneNumber ? 'border-red-500' : ''}`}
                  />
                  {attemptedSubmit && errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('emailAddress')}
                    type="email"
                    placeholder="Enter your email address"
                    className={`w-full ${attemptedSubmit && errors.emailAddress ? 'border-red-500' : ''}`}
                  />
                  {attemptedSubmit && errors.emailAddress && (
                    <p className="text-sm text-red-500">{errors.emailAddress.message}</p>
                  )}
                </div>
              </div>

              {/* Address Lookup - NOW WITH GOOGLE MAPS */}
              <div className="mb-6 w-full max-w-full space-y-2">
                <Controller
                  name="addressLookup"
                  control={control}
                  render={({ field, fieldState }) => (
                    <GoogleMapsInput
                      name="addressLookup"
                      label="Address Lookup"
                      placeholder="Enter your address"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={attemptedSubmit ? fieldState.error : undefined}
                      setValue={setValue}
                      trigger={trigger}
                      onPlaceSelect={placeData => {
                        // Auto-populate address fields
                        const components = placeData.components;
                        if (components) {
                          let streetNumber = '';
                          let route = '';
                          let city = '';
                          let postalCode = '';
                          let province = '';

                          components.forEach((component: any) => {
                            const types = component.types;
                            if (types.includes('street_number')) {
                              streetNumber = component.long_name;
                            }
                            if (types.includes('route')) {
                              route = component.long_name;
                            }
                            if (
                              types.includes('locality') ||
                              types.includes('administrative_area_level_3')
                            ) {
                              city = component.long_name;
                            }
                            if (types.includes('postal_code')) {
                              postalCode = component.long_name;
                            }
                            if (types.includes('administrative_area_level_1')) {
                              province = component.short_name;
                            }
                          });

                          // Auto-populate form fields
                          if (streetNumber && route) {
                            setValue('street', `${streetNumber} ${route}`, {
                              shouldValidate: true,
                            });
                          }
                          if (city) {
                            setValue('city', city, { shouldValidate: true });
                          }
                          if (postalCode) {
                            setValue('postalCode', postalCode, { shouldValidate: true });
                          }
                          if (province) {
                            setValue('province', province, { shouldValidate: true });
                          }
                        }
                      }}
                    />
                  )}
                />
              </div>

              {/* Third Row: Street Address, Apt/Unit/Suite, City */}
              <div className="mb-6 grid w-full max-w-full grid-cols-1">
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('street')}
                    placeholder="Enter street address"
                    className="w-full"
                  />
                  {attemptedSubmit && errors.street && (
                    <p className="text-sm text-red-500">{errors.street.message}</p>
                  )}
                </div>
              </div>

              {/* Fourth Row: Apt/unit/suite, Postal Code, Province, City */}
              <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="suite">Apt / Unit / Suite</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('suite')}
                    placeholder="Enter apt/unit/suite"
                    className="w-full"
                  />
                  {attemptedSubmit && errors.suite && (
                    <p className="text-sm text-red-500">{errors.suite.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('postalCode')}
                    placeholder="Enter postal code"
                    className="w-full"
                  />
                  {attemptedSubmit && errors.postalCode && (
                    <p className="text-sm text-red-500">{errors.postalCode.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province / State</Label>
                  <Dropdown
                    id="province"
                    label=""
                    value={watchedValues.province ?? ''}
                    onChange={(val: string) => setValue('province', val)}
                    options={provinceOptions}
                    placeholder="Select"
                  />
                  {attemptedSubmit && errors.province && (
                    <p className="text-sm text-red-500">{errors.province.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('city')}
                    placeholder="Enter city"
                    className="w-full"
                  />
                  {attemptedSubmit && errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Family Doctor Section */}
              <div className="w-full max-w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relatedCasesDetails">Related Cases Details</Label>
                  <Textarea
                    disabled={isSubmitting}
                    {...register('relatedCasesDetails')}
                    placeholder="Enter related cases details"
                    className={`mt-2 min-h-[100px] w-full resize-none rounded-md ${attemptedSubmit && errors.relatedCasesDetails ? 'border-red-500' : ''}`}
                  />
                  {attemptedSubmit && errors.relatedCasesDetails && (
                    <p className="text-sm text-red-500">{errors.relatedCasesDetails.message}</p>
                  )}
                </div>
                {/* Family Doctor Address and Email */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorName">Family Doctor</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('familyDoctorName')}
                      placeholder="Enter family doctor name"
                      className="w-full"
                    />
                    {attemptedSubmit && errors.familyDoctorName && (
                      <p className="text-sm text-red-500">{errors.familyDoctorName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorEmail">Email Address</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('familyDoctorEmail')}
                      type="email"
                      placeholder="Enter email address"
                      className="w-full"
                    />
                    {attemptedSubmit && errors.familyDoctorEmail && (
                      <p className="text-sm text-red-500">{errors.familyDoctorEmail.message}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Fax */}
                <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorPhone">Phone No.</Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="familyDoctorPhone"
                      value={watch('familyDoctorPhone') || ''}
                      onChange={e =>
                        setValue('familyDoctorPhone', e.target.value, { shouldValidate: true })
                      }
                      placeholder="Enter phone number"
                      className="w-full"
                    />
                    {attemptedSubmit && errors.familyDoctorPhone && (
                      <p className="text-sm text-red-500">{errors.familyDoctorPhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyDoctorFax">Fax No.</Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="familyDoctorFax"
                      value={watch('familyDoctorFax') || ''}
                      onChange={e =>
                        setValue('familyDoctorFax', e.target.value, { shouldValidate: true })
                      }
                      placeholder="Enter fax number"
                      className="w-full"
                      icon={Printer}
                    />
                    {attemptedSubmit && errors.familyDoctorFax && (
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
                disabled={!areAllRequiredFieldsFilled}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimantDetailsForm;
