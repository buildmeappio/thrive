// Step 4
import { useState, useRef } from 'react';
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
  const { setData, data } = useRegistrationStore();
  const email = data.step2?.officialEmailAddress;

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

  const onResendCode = async () => {
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
    try {
      setData('step4', values);

      const otp = values.code;

      if (!email) {
        throw new Error('Email is required');
      }

      const otpVerificationResult = await verifyOtp(otp, email);

      if (!otpVerificationResult.success) {
        throw new Error(otpVerificationResult.error);
      }

      const updatedData = {
        ...data,
        step4: values,
      };

      const registerOrganizationResult = await registerOrganization(updatedData);

      if (!registerOrganizationResult.success) {
        throw new Error(registerOrganizationResult.error);
      }

      if (onNext) onNext();
    } catch (error) {
      log.error('Error in handleSubmit:', error);
      let message = 'An error occurred during registration';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast.error(message);
      toast.error(ErrorMessages.REGISTRATION_FAILED);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] py-6 sm:px-6 md:mt-6 md:min-h-[500px] md:max-w-[970px] md:rounded-[30px] md:px-[75px]"
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
      >
        {({ setFieldValue, errors, setFieldError, isSubmitting }) => {
          return (
            <Form>
              <div className="mt-6 flex min-h-[400px] flex-col items-center justify-center space-y-10 sm:mt-8 sm:space-y-12">
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

                {errors.code && <p className="mt-2 text-sm text-red-500">{errors.code}</p>}

                {/* Resend link */}
                <div className="text-center">
                  <p className="text-base font-normal text-[#000000] sm:text-lg">
                    Didn&apos;t get OTP?{' '}
                    <button
                      disabled={isSubmitting}
                      type="button"
                      onClick={onResendCode}
                      className="font-medium text-[#0B0BB0] underline hover:text-[#0088cc]"
                    >
                      {resending ? 'Resending...' : 'Resend Code'}
                    </button>
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex w-full justify-end">
                  <ContinueButton
                    isSubmitting={isSubmitting}
                    isLastStep={currentStep === totalSteps}
                    color="#000080"
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
