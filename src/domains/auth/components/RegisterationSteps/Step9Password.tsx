import React from 'react';
import { Formik, Form } from 'formik';
import { Label } from '@/components/ui/label';
import ContinueButton from '@/components/ui/ContinueButton';
import { PasswordInput } from '@/components/ui/PasswordInput';
import {
  step9PasswordSchema,
  step9InitialValues,
} from '@/shared/validation/medicalExaminer/examinerRegisterValidation';
import type { Step9PasswordProps } from '@/shared/types/register/medicalExaminer/MedExaminerSetPasswordProps';

export const Step9Password: React.FC<Step9PasswordProps> = ({ onNext }) => {
  const handleSubmit = (values: typeof step9InitialValues) => {
    console.log('Step 9 Form Data:', values);
    onNext();
  };

  return (
    <Formik
      initialValues={step9InitialValues}
      validationSchema={step9PasswordSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, handleChange, submitForm }) => (
        <Form>
          <div className="py-auto flex flex-col items-center space-y-6 px-4 md:px-0">
            <div className="w-full max-w-md pt-1 md:w-3/5 md:max-w-none md:pt-0">
              <div className="mt-0 md:mt-8">
                <div className="space-y-6 md:space-y-6">
                  <div className="space-y-3 md:space-y-2">
                    <Label htmlFor="password" className="text-base text-black md:text-base">
                      Password<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <PasswordInput
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        value={values.password}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-3 md:space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base text-black md:text-base">
                      Confirm Password<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <PasswordInput
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end md:mt-14">
                <ContinueButton onClick={submitForm} gradientFrom="#89D7FF" gradientTo="#00A8FF" />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
