'use client';

import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui';
import { User } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import BackButton from '@/components/BackButton';
import ContinueButton from '@/components/ContinueButton';
import { type OrganizationRegStepProps } from '@/types/registerStepProps';
import { useRegistrationStore } from '@/store/useRegistration';
import { PersonalInfoInitialValues, PersonalInfoSchema } from '../../schemas/invitation';
import { useReactiveValidation } from '@/hooks/useReactiveValidation';
import PhoneInput from '@/components/PhoneNumber';
import { toast } from 'sonner';
import log from '@/utils/log';

interface InvitationData {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: string;
  expiresAt: Date;
}

interface DepartmentOption {
  value: string;
  label: string;
}

type PersonalInfoFormProps = OrganizationRegStepProps & {
  token: string;
  invitationData: InvitationData;
  departmentTypes: DepartmentOption[];
};

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  token,
  invitationData,
  departmentTypes: departmentOptions,
}) => {
  const { setData, data, _hasHydrated } = useRegistrationStore();
  const {
    attemptedSubmit,
    handleSubmitWithValidation,
    createReactiveChangeHandler,
    createReactiveBlurHandler,
    shouldShowError,
  } = useReactiveValidation<typeof PersonalInfoInitialValues>();

  if (!_hasHydrated) {
    return null;
  }

  // Initialize with email from invitation
  const initialValues = {
    ...PersonalInfoInitialValues,
    ...(data.step2 && {
      firstName: data.step2.firstName || '',
      lastName: data.step2.lastName || '',
      phoneNumber: data.step2.phoneNumber || '',
      department: data.step2.department || '',
    }),
  };

  const areAllRequiredFieldsFilled = (values: typeof PersonalInfoInitialValues): boolean => {
    return !!(
      values.firstName?.trim() &&
      values.lastName?.trim() &&
      values.phoneNumber?.trim() &&
      values.department
    );
  };

  const handleSubmit = async (
    values: typeof PersonalInfoInitialValues,
    actions: FormikHelpers<typeof PersonalInfoInitialValues>
  ) => {
    await handleSubmitWithValidation(values, actions, async (vals, helpers) => {
      try {
        // Store data with email from invitation
        setData('step2', {
          ...vals,
          officialEmailAddress: invitationData.email,
        });

        if (onNext) {
          onNext();
        }
      } catch (error) {
        log.error('Error in handleSubmit:', error);
        let message = 'An error occurred while submitting personal information';
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        }
        toast.error(message);
        helpers.setSubmitting(false);
      }
    });
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-4 md:mt-6 md:w-[970px] md:rounded-[30px] md:px-[75px] md:pb-6"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={PersonalInfoSchema}
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
            validateField,
          } = formik;
          const isContinueDisabled = !areAllRequiredFieldsFilled(values);

          return (
            <Form noValidate>
              <div className="space-y-6 px-4 md:px-0">
                <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm text-black">
                      First Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      name="firstName"
                      icon={User}
                      placeholder="Enter your first name"
                      value={values.firstName}
                      onChange={createReactiveChangeHandler('firstName', handleChange, formik)}
                      onBlur={createReactiveBlurHandler(
                        'firstName',
                        () => setFieldTouched('firstName', true),
                        formik
                      )}
                    />
                    {shouldShowError('firstName', touched, errors) && errors.firstName && (
                      <p className="text-xs text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm text-black">
                      Last Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      name="lastName"
                      icon={User}
                      placeholder="Enter your last name"
                      value={values.lastName}
                      onChange={createReactiveChangeHandler('lastName', handleChange, formik)}
                      onBlur={createReactiveBlurHandler(
                        'lastName',
                        () => setFieldTouched('lastName', true),
                        formik
                      )}
                    />
                    {shouldShowError('lastName', touched, errors) && errors.lastName && (
                      <p className="text-xs text-red-500">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm text-black">
                      Phone Number<span className="text-red-500">*</span>
                    </Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="phoneNumber"
                      placeholder="Enter your phone number"
                      value={values.phoneNumber}
                      onChange={createReactiveChangeHandler('phoneNumber', handleChange, formik)}
                      onBlur={createReactiveBlurHandler(
                        'phoneNumber',
                        () => setFieldTouched('phoneNumber', true),
                        formik
                      )}
                    />
                    {shouldShowError('phoneNumber', touched, errors) && errors.phoneNumber && (
                      <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Dropdown
                      id="department"
                      label="Department"
                      value={values.department}
                      onChange={async (value: string) => {
                        setFieldValue('department', value);
                        if (attemptedSubmit) {
                          setFieldTouched('department', true);
                          const error = await validateField('department');
                          if (error === undefined) {
                            const currentErrors = { ...errors };
                            if (currentErrors.department) {
                              delete currentErrors.department;
                              formik.setErrors(currentErrors);
                            }
                          }
                        }
                      }}
                      options={departmentOptions}
                      required={true}
                      placeholder={'Select Department'}
                    />
                    {shouldShowError('department', touched, errors) && errors.department && (
                      <p className="text-xs text-red-500">{errors.department}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-row justify-end gap-4 px-4 md:px-0">
                <ContinueButton
                  isSubmitting={isSubmitting}
                  isLastStep={currentStep === totalSteps}
                  color="#000080"
                  disabled={isContinueDisabled}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default PersonalInfoForm;
