import React from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import {
  step3ComplianceAccessInitialValues,
  step3ComplianceAccessSchema,
} from '@/features/organization/organization.schema';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OrganizationRegStepProps } from '@/shared/types/register/organization/organizationRegStepProps';
import { useOrgRegFormStore } from '@/store/useOrgRegFormStore';
import { sendOtp } from '@/shared/lib/sendOtp';

export const Step3ComplianceAccess: React.FC<OrganizationRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { setData, data } = useOrgRegFormStore();

  const handleSubmit = async (
    values: typeof step3ComplianceAccessInitialValues, 
    actions: FormikHelpers<typeof step3ComplianceAccessInitialValues>
  ) => {
    setData('step3', values);

    const email = data.step2?.officialEmailAddress;
    if (email) {
      await sendOtp(email);
      console.log("OTP sent to", email);
    }

    actions.setSubmitting(false);

    if (onNext) {
      onNext();
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[450px] md:w-[950px] md:rounded-[30px] md:px-[75px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={data.step3 ?? step3ComplianceAccessInitialValues}
        validationSchema={step3ComplianceAccessSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, setFieldValue, submitForm }) => (
          <Form>
            <div className="space-y-6 px-4 pb-8 md:px-0">
              <div className="mt-8 flex flex-col items-start justify-center space-y-12 md:mt-12 md:items-center">
                {/* Terms & Conditions Checkbox */}
                <div className="flex items-start space-x-3 md:items-center">
                  <Checkbox
                    id="agreeTermsConditions"
                    checked={values.agreeTermsConditions}
                    onCheckedChange={checked => setFieldValue('agreeTermsConditions', checked)}
                  />
                  <Label
                    htmlFor="agreeTermsConditions"
                    className="cursor-pointer text-xs leading-relaxed break-words text-black sm:text-sm"
                  >
                    Agree to{' '}
                    <a
                      href="/terms-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words text-[#00A8FF] underline hover:text-[#0088CC]"
                    >
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words text-[#00A8FF] underline hover:text-[#0088CC]"
                    >
                      Privacy Policy
                    </a>
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
                {errors.agreeTermsConditions && (
                  <p className="-mt-2 text-xs text-red-500">{errors.agreeTermsConditions}</p>
                )}

                {/* Secure Data Handling Checkbox */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="consentSecureDataHandling"
                    checked={values.consentSecureDataHandling}
                    onCheckedChange={checked => setFieldValue('consentSecureDataHandling', checked)}
                  />
                  <Label
                    htmlFor="consentSecureDataHandling"
                    className="cursor-pointer text-sm leading-relaxed text-black"
                  >
                    I consent to secure data handling
                  </Label>
                </div>
                {errors.consentSecureDataHandling && (
                  <p className="-mt-2 text-xs text-red-500">{errors.consentSecureDataHandling}</p>
                )}

                {/* Authorization Checkbox */}
                <div className="flex items-start space-x-3 md:items-center">
                  <Checkbox
                    id="authorizedToCreateAccount"
                    checked={values.authorizedToCreateAccount}
                    onCheckedChange={checked => setFieldValue('authorizedToCreateAccount', checked)}
                  />
                  <Label
                    htmlFor="authorizedToCreateAccount"
                    className="cursor-pointer text-sm leading-relaxed text-black"
                  >
                    I am authorized to create this account on behalf of my organization
                  </Label>
                </div>
                {errors.authorizedToCreateAccount && (
                  <p className="-mt-2 text-xs text-red-500">{errors.authorizedToCreateAccount}</p>
                )}
              </div>

              <div className="mt-20 flex flex-row justify-center gap-4 md:mt-32 md:justify-between">
                <BackButton
                  onClick={onPrevious}
                  disabled={currentStep === 1}
                  borderColor="#000080"
                  iconColor="#000080"
                />
                <ContinueButton
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
