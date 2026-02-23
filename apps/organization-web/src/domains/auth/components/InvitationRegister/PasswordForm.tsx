'use client';

import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import ContinueButton from '@/components/ContinueButton';
import BackButton from '@/components/BackButton';
import { type OrganizationRegStepProps } from '@/types/registerStepProps';
import { PasswordInitialValues, PasswordSchema } from '../../schemas/register';
import ErrorMessages from '@/constants/ErrorMessages';
import { toast } from 'sonner';
import useRouter from '@/hooks/useRouter';
import { URLS } from '@/constants/routes';
import { HttpError } from '@/utils/httpError';
import log from '@/utils/log';

interface InvitationData {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: string;
  expiresAt: Date;
}

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  officialEmailAddress: string;
  jobTitle?: string;
  department: string;
}

interface PasswordData {
  password: string;
  confirmPassword: string;
}

type InvitationPasswordFormProps = Omit<OrganizationRegStepProps, 'onNext'> & {
  token: string;
  invitationData: InvitationData;
  personalInfo: PersonalInfoData;
  onNext: (data: PasswordData) => void;
};

const PasswordForm: React.FC<InvitationPasswordFormProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  token,
  invitationData,
  personalInfo,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const router = useRouter();

  // Check if all required fields are filled
  const areAllRequiredFieldsFilled = (values: typeof PasswordInitialValues): boolean => {
    return !!(values.password?.trim() && values.confirmPassword?.trim());
  };

  const handleSubmit = async (
    values: typeof PasswordInitialValues,
    actions: FormikHelpers<typeof PasswordInitialValues>
  ) => {
    setAttemptedSubmit(true);

    // Validate form
    const errors = await actions.validateForm();

    // If there are any errors, set errors and touched fields, then return
    if (Object.keys(errors).length > 0) {
      actions.setErrors(errors);
      Object.keys(errors).forEach(field => {
        actions.setFieldTouched(field as keyof typeof PasswordInitialValues, true);
      });
      actions.setSubmitting(false);
      return;
    }

    try {
      if (!personalInfo) {
        throw new HttpError(400, 'Personal information is required');
      }

      // Pass password data to parent component
      const passwordData: PasswordData = {
        password: values.password,
        confirmPassword: values.confirmPassword,
      };

      // Navigate to success screen immediately
      // The success screen will handle DB save and session creation
      onNext(passwordData);
    } catch (error) {
      log.error('Error in handleSubmit:', error);
      let message = 'An error occurred while processing your request';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast.error(message);
      actions.setSubmitting(false);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-6 md:min-h-[350px] md:w-[970px] md:rounded-[30px] md:px-[75px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={PasswordInitialValues}
        validationSchema={PasswordSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize={true}
      >
        {({ values, errors, handleChange, isSubmitting, touched }) => {
          const isContinueDisabled = !areAllRequiredFieldsFilled(values);
          const showErrors = attemptedSubmit || Object.keys(touched).length > 0;

          return (
            <Form>
              <div className="md:space-y-12">
                <div className="mx-auto mt-4 w-full px-4 pb-6 md:mt-12 md:max-w-[460px] md:px-0">
                  <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-1">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm text-black">
                        Password<span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          disabled={isSubmitting}
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={values.password}
                          onChange={handleChange}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {showErrors && errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm text-black">
                        Confirm Password<span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          disabled={isSubmitting}
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {showErrors && errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-8 flex justify-between gap-4 px-4 md:px-0">
                  <BackButton
                    onClick={onPrevious}
                    disabled={currentStep === 1}
                    borderColor="#000080"
                    iconColor="#000080"
                    isSubmitting={isSubmitting}
                  />
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

export default PasswordForm;
