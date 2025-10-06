'use client';

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

type CLaimTypeProps = IMEReferralProps & {
  claimTypes: OrganizationTypeOption[];
};

const ClaimantDetailsForm: React.FC<CLaimTypeProps> = ({
  onNext,
  currentStep,
  totalSteps,
  claimTypes: claimTypeOptions,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();

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
    defaultValues: data.step1 || ClaimantDetailsInitialValues,
    mode: 'onChange',
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<ClaimantDetails> = values => {
    setData('step1', values);

    if (onNext) {
      onNext();
    }
  };

  if (!_hasHydrated) {
    return null;
  }

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
              <div className="mb-4">
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
                  {errors.claimType && (
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
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Second Row: Gender, Phone, Email */}
              <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-5">
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
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
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
                    className={`w-full ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
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

              {/* Address Lookup - NOW WITH GOOGLE MAPS */}
              <div className="mb-4 w-full max-w-full space-y-2">
                <Controller
                  name="addressLookup"
                  control={control}
                  render={({ field, fieldState }) => (
                    <GoogleMapsInput
                      name="addressLookup"
                      label="Address Lookup"
                      placeholder="150 John Street, Toronto"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error}
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
              <div className="mb-4 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('street')}
                    placeholder="50 Stephanie Street"
                    className="w-full"
                  />
                  {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="suite">Apt / Unit / Suite</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('suite')}
                    placeholder="402"
                    className="w-full"
                  />
                  {errors.suite && <p className="text-sm text-red-500">{errors.suite.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="postalCode">Postal Code</Label>
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
              </div>

              {/* Fourth Row: Province, City */}
              <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
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
                  {errors.province && (
                    <p className="text-sm text-red-500">{errors.province.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register('city')}
                    placeholder="Toronto"
                    className="w-full"
                  />
                  {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                </div>
                <div></div>
              </div>

              {/* Family Doctor Section */}
              <div className="w-full max-w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relatedCasesDetails">Related Cases Details</Label>
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
                    <Label htmlFor="familyDoctorName">Family Doctor</Label>
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
                    <Label htmlFor="familyDoctorEmail">Email Address</Label>
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
                    <Label htmlFor="familyDoctorPhone">Phone No.</Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="familyDoctorPhone"
                      value={watch('familyDoctorPhone') || ''}
                      onChange={e =>
                        setValue('familyDoctorPhone', e.target.value, { shouldValidate: true })
                      }
                      className="w-full"
                    />
                    {errors.familyDoctorPhone && (
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
