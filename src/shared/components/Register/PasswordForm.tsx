// Step 5
import React from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/shared/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { type OrganizationRegStepProps } from '@/shared/types/register/registerStepProps';
import { useOrgRegFormStore } from '@/store/useOrgRegFormStore';
import { finalizeOrganizationRegistrationAction } from '@/features/organization/organization.actions';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  PasswordInitialValues,
  PasswordSchema,
} from '@/shared/validation/register/registerValidation';
import ErrorMessages from '@/constants/ErrorMessages';

const PasswordForm: React.FC<OrganizationRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const router = useRouter();

  const { setData, data } = useOrgRegFormStore();

  const handleSubmit = async (
    values: typeof PasswordInitialValues,
    actions: FormikHelpers<typeof PasswordInitialValues>
  ) => {
    setData('step5', values);

    const res = await finalizeOrganizationRegistrationAction(data);

    if (res.success) {
      if (onNext) onNext();
    } else {
      actions.setFieldError('code', 'Error');
    }

    actions.setSubmitting(false);

    const result = await signIn('credentials', {
      email: data.step2?.officialEmailAddress,
      password: values.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      throw new Error(ErrorMessages.LOGIN_FAILED);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[450px] md:w-[970px] md:rounded-[30px] md:px-[75px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={data.step5 ?? PasswordInitialValues}
        validationSchema={PasswordSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, handleChange }) => (
          <Form>
            <div className="md:space-y-24">
              <div className="mx-auto mt-4 w-full px-4 pb-8 md:mt-12 md:max-w-[460px] md:px-0">
                <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-black">
                      Password<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
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
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm text-black">
                      Confirm Password<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
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
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
                <BackButton
                  onClick={onPrevious}
                  disabled={currentStep === 1}
                  borderColor="#000080"
                  iconColor="#000080"
                />
                <ContinueButton isLastStep={currentStep === totalSteps} color="#000080" />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
export default PasswordForm;
