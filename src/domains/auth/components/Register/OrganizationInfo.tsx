// Step 1
'use client';

import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import { Input } from '@/components/ui';
import { provinceOptions } from '@/config/ProvinceOptions';
import { Dropdown } from '@/components/Dropdown';
import { Form, Formik, type FormikHelpers } from 'formik';
import ContinueButton from '@/components/ContinueButton';
import { type OrganizationRegStepProps } from '@/types/registerStepProps';
import { useRegistrationStore } from '@/store/useRegistration';
import { OrganizationInfoInitialValues, OrganizationInfoSchema } from '../../schemas/register';
import GoogleMapsInput from '@/components/GoogleMapsInput';
import { checkOrganizationName } from '../../actions';
import { toast } from 'sonner';
import { useReactiveValidation } from '@/hooks/useReactiveValidation';

export interface OrganizationTypeOption {
  value: string;
  label: string;
}

type OrganizationInfoProps = OrganizationRegStepProps & {
  organizationTypes: OrganizationTypeOption[];
  isUpdateMode?: boolean;
};

const OrganizationInfo: React.FC<OrganizationInfoProps> = ({
  onNext,
  currentStep = 1,
  totalSteps = 3,
  organizationTypes: organizationTypeOptions,
  isUpdateMode = false,
}) => {
  const { setData, data, _hasHydrated } = useRegistrationStore();
  const {
    attemptedSubmit,
    handleSubmitWithValidation,
    createReactiveChangeHandler,
    createReactiveBlurHandler,
    shouldShowError,
  } = useReactiveValidation<typeof OrganizationInfoInitialValues>();

  if (!_hasHydrated) {
    return null;
  }

  // Check if all required fields are filled
  const areAllRequiredFieldsFilled = (values: typeof OrganizationInfoInitialValues): boolean => {
    const organizationType = values.organizationType?.trim() || '';
    const organizationName = values.organizationName?.trim() || '';
    const addressLookup = values.addressLookup?.trim() || '';
    const streetAddress = values.streetAddress?.trim() || '';
    const city = values.city?.trim() || '';
    const postalCode = values.postalCode?.trim() || '';

    return !!(
      organizationType &&
      organizationName &&
      addressLookup &&
      streetAddress &&
      city &&
      postalCode
    );
  };

  const handleSubmit = async (
    values: typeof OrganizationInfoInitialValues,
    formikHelpers: FormikHelpers<typeof OrganizationInfoInitialValues>
  ) => {
    await handleSubmitWithValidation(
      values,
      formikHelpers,
      async (vals, helpers) => {
        try {
          // Skip organization name check in update mode
          if (!isUpdateMode) {
            const exists = await checkOrganizationName(vals.organizationName);
            console.log('Organization exists:', exists);

            // Check if the action was successful first
            if (!exists.success) {
              toast.error(exists.error);
              helpers.setSubmitting(false);
              return;
            }

            // Now TypeScript knows exists.data is available
            if (exists.data) {
              toast.error('This organization already exists.');
              helpers.setSubmitting(false);
              return;
            }
          }

          setData('step1', vals);

          if (onNext) {
            onNext();
          }
        } catch (error) {
          console.error('Error during submission:', error);
          helpers.setSubmitting(false);
        }
      },
      ['organizationType'] // Prioritize organizationType validation
    );
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-2 md:min-h-[530px] md:w-[970px] md:rounded-[30px] md:px-[75px]"
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
        enableReinitialize={true}
      >
        {formik => {
          const {
            values,
            errors,
            handleChange,
            setFieldValue,
            isSubmitting,
            touched,
            setFieldTouched,
          } = formik;
          // Check if all required fields are filled - this will re-compute on every render
          const isContinueDisabled = !areAllRequiredFieldsFilled(values);

          // Create reactive change handler for organizationName
          const handleOrganizationNameChange = createReactiveChangeHandler(
            'organizationName',
            handleChange,
            formik
          );

          const handleOrganizationNameBlur = createReactiveBlurHandler(
            'organizationName',
            () => setFieldTouched('organizationName', true),
            formik
          );

          return (
            <Form>
              <div className="space-y-6 px-4 pb-4 md:space-y-10 md:px-0">
                <div className="pt-1 md:pt-2">
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Dropdown
                          id="organizationType"
                          label="Organization Type"
                          value={values.organizationType}
                          onChange={async (value: string) => {
                            setFieldValue('organizationType', value);
                            // Validate in real-time after attempted submit
                            if (attemptedSubmit) {
                              setFieldTouched('organizationType', true);
                              await formik.validateField('organizationType');
                            }
                          }}
                          options={organizationTypeOptions}
                          required={true}
                          placeholder={'Select Organization Type'}
                        />
                        {shouldShowError('organizationType', touched, errors) &&
                          errors.organizationType && (
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
                          disabled={isSubmitting || isUpdateMode}
                          id="organizationName"
                          name="organizationName"
                          placeholder="Desjardins"
                          required
                          onChange={handleOrganizationNameChange}
                          onBlur={handleOrganizationNameBlur}
                          value={values.organizationName}
                          className={isUpdateMode ? 'cursor-not-allowed bg-gray-100' : ''}
                        />
                        {shouldShowError('organizationName', touched, errors) &&
                          errors.organizationName && (
                            <p className="text-sm text-red-500">{errors.organizationName}</p>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1">
                      <div className="space-y-2">
                        <GoogleMapsInput
                          name="addressLookup"
                          label="Address Lookup"
                          required
                          from="address"
                          formik={formik}
                          onReactiveChange={createReactiveChangeHandler(
                            'addressLookup',
                            handleChange,
                            formik
                          )}
                          onReactiveBlur={createReactiveBlurHandler(
                            'addressLookup',
                            () => setFieldTouched('addressLookup', true),
                            formik
                          )}
                          onPlaceSelect={placeData => {
                            // Optionally auto-populate other address fields
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

                              // Auto-populate address fields
                              if (streetNumber && route) {
                                setFieldValue('streetAddress', `${streetNumber} ${route}`);
                                // Validate street address after auto-population
                                if (attemptedSubmit) {
                                  requestAnimationFrame(() => {
                                    setTimeout(async () => {
                                      setFieldTouched('streetAddress', true);
                                      const error = await formik.validateField('streetAddress');
                                      const currentErrors = { ...formik.errors };
                                      if (error === undefined) {
                                        delete currentErrors.streetAddress;
                                      } else {
                                        currentErrors.streetAddress = error;
                                      }
                                      formik.setErrors(currentErrors);
                                    }, 0);
                                  });
                                }
                              }
                              if (city) {
                                setFieldValue('city', city);
                                // Validate city after auto-population
                                if (attemptedSubmit) {
                                  requestAnimationFrame(() => {
                                    setTimeout(async () => {
                                      setFieldTouched('city', true);
                                      const error = await formik.validateField('city');
                                      const currentErrors = { ...formik.errors };
                                      if (error === undefined) {
                                        delete currentErrors.city;
                                      } else {
                                        currentErrors.city = error;
                                      }
                                      formik.setErrors(currentErrors);
                                    }, 0);
                                  });
                                }
                              }
                              if (postalCode) {
                                setFieldValue('postalCode', postalCode);
                                // Validate postal code after auto-population
                                if (attemptedSubmit) {
                                  requestAnimationFrame(() => {
                                    setTimeout(async () => {
                                      setFieldTouched('postalCode', true);
                                      const error = await formik.validateField('postalCode');
                                      const currentErrors = { ...formik.errors };
                                      if (error === undefined) {
                                        delete currentErrors.postalCode;
                                      } else {
                                        currentErrors.postalCode = error;
                                      }
                                      formik.setErrors(currentErrors);
                                    }, 0);
                                  });
                                }
                              }
                              if (province) {
                                setFieldValue('provinceOfResidence', province);
                              }
                            }
                            // Validate address lookup after place selection
                            if (attemptedSubmit) {
                              requestAnimationFrame(() => {
                                setTimeout(async () => {
                                  setFieldTouched('addressLookup', true);
                                  const error = await formik.validateField('addressLookup');
                                  const currentErrors = { ...formik.errors };
                                  if (error === undefined) {
                                    delete currentErrors.addressLookup;
                                  } else {
                                    currentErrors.addressLookup = error;
                                  }
                                  formik.setErrors(currentErrors);
                                }, 0);
                              });
                            }
                          }}
                        />
                        {shouldShowError('addressLookup', touched, errors) &&
                          errors.addressLookup && (
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
                          onChange={createReactiveChangeHandler(
                            'streetAddress',
                            handleChange,
                            formik
                          )}
                          onBlur={createReactiveBlurHandler(
                            'streetAddress',
                            () => setFieldTouched('streetAddress', true),
                            formik
                          )}
                          value={values.streetAddress}
                        />
                        {shouldShowError('streetAddress', touched, errors) &&
                          errors.streetAddress && (
                            <p className="text-sm text-red-500">{errors.streetAddress}</p>
                          )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          className="text-sm leading-relaxed font-normal"
                          htmlFor="aptUnitSuite"
                        >
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
                          onChange={createReactiveChangeHandler('city', handleChange, formik)}
                          onBlur={createReactiveBlurHandler(
                            'city',
                            () => setFieldTouched('city', true),
                            formik
                          )}
                          value={values.city}
                        />
                        {shouldShowError('city', touched, errors) && errors.city && (
                          <p className="text-sm text-red-500">{errors.city}</p>
                        )}
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
                          placeholder="A1A 1A1"
                          required
                          onChange={createReactiveChangeHandler('postalCode', handleChange, formik)}
                          onBlur={createReactiveBlurHandler(
                            'postalCode',
                            () => setFieldTouched('postalCode', true),
                            formik
                          )}
                          value={values.postalCode}
                        />
                        {shouldShowError('postalCode', touched, errors) && errors.postalCode && (
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
                        {shouldShowError('provinceOfResidence', touched, errors) &&
                          errors.provinceOfResidence && (
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
                            placeholder="https://desjardins.com"
                            className="pl-10"
                            onChange={createReactiveChangeHandler(
                              'organizationWebsite',
                              handleChange,
                              formik
                            )}
                            onBlur={createReactiveBlurHandler(
                              'organizationWebsite',
                              () => setFieldTouched('organizationWebsite', true),
                              formik
                            )}
                            value={values.organizationWebsite}
                          />
                        </div>
                        {shouldShowError('organizationWebsite', touched, errors) &&
                          errors.organizationWebsite && (
                            <p className="text-sm text-red-500">{errors.organizationWebsite}</p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <ContinueButton
                    isSubmitting={isSubmitting}
                    isLastStep={currentStep === totalSteps}
                    color="#000080"
                    disabled={isContinueDisabled}
                  />
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default OrganizationInfo;
