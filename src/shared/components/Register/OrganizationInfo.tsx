// Step 1
'use client';

import { Label } from '@/shared/components/ui/label';
import { Globe, MapPin } from 'lucide-react';
import { Input } from '@/shared/components/ui';
import { provinceOptions } from '@/shared/config/ProvinceOptions';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import { Form, Formik, type FormikHelpers } from 'formik';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { type OrganizationRegStepProps } from '@/shared/types/register/registerStepProps';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { checkOrganizationNameAction } from '@/features/organization.actions';
import {
  OrganizationInfoInitialValues,
  OrganizationInfoSchema,
} from '@/shared/validation/register/registerValidation';
import ErrorMessages from '@/constants/ErrorMessages';

export interface OrganizationTypeOption {
  value: string;
  label: string;
}

type OrganizationInfoProps = OrganizationRegStepProps & {
  organizationTypes: OrganizationTypeOption[];
};

const OrganizationInfo: React.FC<OrganizationInfoProps> = ({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 3,
  organizationTypes: organizationTypeOptions,
}) => {
  const { setData, data } = useRegistrationStore();

  const handleSubmit = async (
    values: typeof OrganizationInfoInitialValues,
    actions: FormikHelpers<typeof OrganizationInfoInitialValues>
  ) => {
    try {
      const exists = await checkOrganizationNameAction(values.organizationName);

      if (exists) {
        actions.setFieldError('organizationName', ErrorMessages.ORG_NAME_ALREADY_EXISTS);
        return;
      }

      setData('step1', values);

      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Error during submission:', error);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-8 md:mt-6 md:min-h-[600px] md:w-[970px] md:rounded-[30px] md:px-[75px] md:pb-0"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={data.step1 ?? OrganizationInfoInitialValues}
        validationSchema={OrganizationInfoSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, handleChange, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="space-y-6 px-4 md:space-y-14 md:px-0">
              <div className="pt-1 md:pt-4">
                <div className="mt-6 space-y-5 md:mt-8">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Dropdown
                        id="organizationType"
                        label="Organization Type"
                        value={values.organizationType}
                        onChange={(value: string) => setFieldValue('organizationType', value)}
                        options={organizationTypeOptions}
                        required={true}
                        placeholder={'Select Organization Type'}
                      />
                      {errors.organizationType && (
                        <p className="text-sm text-red-500">{errors.organizationType}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-sm leading-relaxed font-normal"
                        htmlFor="organizationName"
                      >
                        Organization Name<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        disabled={isSubmitting}
                        id="organizationName"
                        name="organizationName"
                        placeholder="Desjardins"
                        required
                        onChange={handleChange}
                        value={values.organizationName}
                      />
                      {errors.organizationName && (
                        <p className="text-sm text-red-500">{errors.organizationName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div className="space-y-2">
                      <Label
                        className="text-sm leading-relaxed font-normal"
                        htmlFor="addressLookup"
                      >
                        Address Lookup<span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          disabled={isSubmitting}
                          id="addressLookup"
                          name="addressLookup"
                          placeholder="150 John Street"
                          className="pl-10"
                          required
                          onChange={handleChange}
                          value={values.addressLookup}
                        />
                      </div>
                      {errors.addressLookup && (
                        <p className="text-sm text-red-500">{errors.addressLookup}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label
                        className="text-sm leading-relaxed font-normal"
                        htmlFor="streetAddress"
                      >
                        Street Address<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        disabled={isSubmitting}
                        id="streetAddress"
                        name="streetAddress"
                        placeholder="50 Stephanie Street"
                        required
                        onChange={handleChange}
                        value={values.streetAddress}
                      />
                      {errors.streetAddress && (
                        <p className="text-sm text-red-500">{errors.streetAddress}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm leading-relaxed font-normal" htmlFor="aptUnitSuite">
                        Apt / Unit / Suite
                      </Label>
                      <Input
                        disabled={isSubmitting}
                        id="aptUnitSuite"
                        name="aptUnitSuite"
                        placeholder="402"
                        onChange={handleChange}
                        value={values.aptUnitSuite}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm leading-relaxed font-normal" htmlFor="city">
                        City<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        disabled={isSubmitting}
                        id="city"
                        name="city"
                        placeholder="Toronto"
                        required
                        onChange={handleChange}
                        value={values.city}
                      />
                      {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm leading-relaxed font-normal" htmlFor="postalCode">
                        Postal Code<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        disabled={isSubmitting}
                        id="postalCode"
                        name="postalCode"
                        placeholder="7200"
                        required
                        onChange={handleChange}
                        value={values.postalCode}
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-red-500">{errors.postalCode}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Dropdown
                        id="provinceOfResidence"
                        label="Province / State"
                        value={values.provinceOfResidence}
                        onChange={(value: string) => setFieldValue('provinceOfResidence', value)}
                        options={provinceOptions}
                        placeholder="Select Province"
                      />
                      {errors.provinceOfResidence && (
                        <p className="text-sm text-red-500">{errors.provinceOfResidence}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-sm leading-relaxed font-normal"
                        htmlFor="organizationWebsite"
                      >
                        Organization Website
                      </Label>
                      <div className="relative">
                        <Globe className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          disabled={isSubmitting}
                          id="organizationWebsite"
                          name="organizationWebsite"
                          type="url"
                          placeholder="www.desjardins.com"
                          className="pl-10"
                          onChange={handleChange}
                          value={values.organizationWebsite}
                        />
                      </div>
                      {errors.organizationWebsite && (
                        <p className="text-sm text-red-500">{errors.organizationWebsite}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-center gap-4 md:justify-between">
                <BackButton
                  onClick={onPrevious}
                  disabled={currentStep === 1}
                  borderColor="#000080"
                  iconColor="#000080"
                />
                <ContinueButton
                  isSubmitting={isSubmitting}
                  isLastStep={currentStep === totalSteps}
                  color="#000080"
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OrganizationInfo;
