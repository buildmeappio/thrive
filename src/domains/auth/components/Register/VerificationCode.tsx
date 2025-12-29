// Step 4
'use client';
import { useState, useRef, useEffect } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import ContinueButton from '@/components/ContinueButton';
import { type OrganizationRegStepProps } from '@/types/registerStepProps';
import { useRegistrationStore } from '@/store/useRegistration';
import { VerificationCodeInitialValues, VerificationCodeSchema } from '../../schemas/register';
import { toast } from 'sonner';
import SuccessMessages from '@/constants/SuccessMessages';
import { registerOrganization, sendOtp, verifyOtp } from '../../actions';
import ErrorMessages from '@/constants/ErrorMessages';
import log from '@/utils/log';

const VerificationCode: React.FC<OrganizationRegStepProps> = ({
  onNext,
  currentStep,
  totalSteps,
}) => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resending, setResending] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60); // Start with 60 seconds cooldown
  const { setData, data } = useRegistrationStore();
  const email = data.step2?.officialEmailAddress;

  // Initialize cooldown timer when component mounts
  useEffect(() => {
    // Start 60 second cooldown when user first lands on this page
    setResendCooldown(60);
  }, []);

  // Check if all required fields are filled
  const areAllRequiredFieldsFilled = (codeValue: string): boolean => {
    return codeValue.length === 4;
  };

  const handleInputChange = (
    index: number,
    value: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    setFieldValue('code', newCode.join(''));

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onResendCode = async () => {
    if (resendCooldown > 0 || resending) {
      return; // Prevent multiple clicks during cooldown
    }

    try {
      setResending(true);
      if (!email) {
        throw new Error('Email is required');
      }
      const result = await sendOtp(email);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(SuccessMessages.OTP_RESENT);
      // Start 60 second cooldown
      setResendCooldown(60);
    } catch (error) {
      log.error('Error in onResendCode:', error);
      let message = 'An error occurred while resending the code';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent,
    setFieldValue: (field: string, value: any) => void
  ) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.replace(/\D/g, '').slice(0, 4);

    if (digits.length === 4) {
      const newCode = digits.split('');
      setCode(newCode);
      setFieldValue('code', newCode.join(''));
      inputRefs.current[3]?.focus();
    }
  };

  const handleSubmit = async (
    values: typeof VerificationCodeInitialValues,
    actions: FormikHelpers<typeof VerificationCodeInitialValues>
  ) => {
    setAttemptedSubmit(true);

    // Validate form
    const errors = await actions.validateForm();

    // If there are any errors, set errors and touched fields, then return
    if (Object.keys(errors).length > 0) {
      // Set errors in Formik state so they can be displayed
      actions.setErrors(errors);

      // Set all error fields as touched
      Object.keys(errors).forEach(field => {
        actions.setFieldTouched(field as keyof typeof VerificationCodeInitialValues, true);
      });
      actions.setSubmitting(false);
      return;
    }

    try {
      setData('step4', values);

      const otp = values.code;

      if (!email) {
        throw new Error('Email is required');
      }

      const otpVerificationResult = await verifyOtp(otp, email);

      if (!otpVerificationResult.success) {
        // Handle OTP verification errors specifically - show only in toast
        const errorMessage = otpVerificationResult.error || 'Invalid verification code';
        toast.error(errorMessage);
        actions.setSubmitting(false);
        return;
      }

      const updatedData = {
        ...data,
        step4: values,
      };

      const registerOrganizationResult = await registerOrganization(updatedData);

      if (!registerOrganizationResult.success) {
        const errorMsg = registerOrganizationResult.error || ErrorMessages.REGISTRATION_FAILED;
        throw new Error(errorMsg);
      }

      if (onNext) onNext();
    } catch (error) {
      log.error('Error in handleSubmit:', error);
      let message: string = ErrorMessages.REGISTRATION_FAILED;
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast.error(message);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] py-6 pb-8 sm:px-6 md:min-h-[300px] md:max-w-[900px] md:rounded-[30px] md:px-[75px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={data.step4 ?? VerificationCodeInitialValues}
        validationSchema={VerificationCodeSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize={true}
      >
        {({ setFieldValue, errors, setFieldError, isSubmitting, touched, values }) => {
          const isContinueDisabled = !areAllRequiredFieldsFilled(values.code);
          const showErrors = attemptedSubmit || Object.keys(touched).length > 0;

          return (
            <Form>
              <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center space-y-6 sm:mt-8 sm:space-y-12">
                <div className="text-center">
                  <p className="mt-2 text-base leading-relaxed font-medium text-[#6C7278] sm:text-lg md:text-[20px]">
                    Enter the 4 digit verification code we have sent to {email}
                  </p>
                </div>

                {/* OTP Inputs */}
                <div className="flex w-full max-w-[400px] justify-between gap-2 sm:gap-4">
                  {code.map((digit, index) => (
                    <input
                      disabled={isSubmitting}
                      key={index}
                      ref={el => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleInputChange(index, e.target.value, setFieldValue)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={index === 0 ? e => handlePaste(e, setFieldValue) : undefined}
                      onFocus={() => {
                        // Clear error when user focuses on input
                        if (errors.code) {
                          setFieldError('code', '');
                        }
                      }}
                      className="aspect-square w-[60px] rounded-xl border-2 border-[#C2C2C282] bg-[#F9F9F9] text-center text-xl font-medium text-[#140047] focus:border-[#00A8FF] focus:outline-none sm:w-[80px] sm:text-2xl md:w-[100px] md:rounded-2xl md:text-[28px]"
                      style={{
                        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.08)',
                      }}
                    />
                  ))}
                </div>

                {showErrors && errors.code && (
                  <p className="mt-2 text-sm text-red-500">{errors.code}</p>
                )}

                {/* Resend link */}
                <div className="text-center">
                  <p className="text-base font-normal text-[#000000] sm:text-lg">
                    Didn&apos;t get OTP?{' '}
                    <button
                      disabled={isSubmitting || resending || resendCooldown > 0}
                      type="button"
                      onClick={onResendCode}
                      className={`font-medium underline ${
                        resendCooldown > 0 || isSubmitting || resending
                          ? 'cursor-not-allowed text-gray-400'
                          : 'text-[#0B0BB0] hover:text-[#0088cc]'
                      }`}
                    >
                      {resending
                        ? 'Resending...'
                        : resendCooldown > 0
                          ? `Resend Code (${resendCooldown}s)`
                          : 'Resend Code'}
                    </button>
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex w-full justify-end">
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

export default VerificationCode;
