'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
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
    formState: { errors, isSubmitting },
  } = useForm<LegalDetails>({
    resolver: zodResolver(LegalDetailsSchema),
    defaultValues: data.step3 || LegalDetailsInitialValues,
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<LegalDetails> = values => {
    setData('step3', values);
    if (onNext) onNext();
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
                    <Input
                      disabled={isSubmitting}
                      {...register('legalPhone')}
                      placeholder="4444444444"
                      className="w-full"
                      type="tel"
                      onKeyPress={e => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.legalPhone && (
                      <p className="text-sm text-red-500">{errors.legalPhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalFaxNo">Fax No.</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalFaxNo')}
                      placeholder="4444444444"
                      className="w-full"
                      type="tel"
                      onKeyPress={e => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.legalFaxNo && (
                      <p className="text-sm text-red-500">{errors.legalFaxNo.message}</p>
                    )}
                  </div>
                </div>

                {/* Legal Address Lookup */}
                <div className="mb-4 w-full max-w-full space-y-2">
                  <Label htmlFor="legalAddressLookup">Address Lookup</Label>
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
                  <div>
                    <Label htmlFor="legalPostalCode">Postal Code</Label>
                    <Input
                      disabled={isSubmitting}
                      {...register('legalPostalCode')}
                      placeholder="A1A 1A1"
                      className="w-full"
                    />
                  </div>
                  {errors.legalPostalCode && (
                    <p className="text-sm text-red-500">{errors.legalPostalCode.message}</p>
                  )}
                </div>
              </div>

              {/* Legal Postal Code and Province */}
              <div className="mb-8 grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-3">
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

                  <div></div>
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
