// Step 4
import { useState, useRef, useEffect } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { type OrganizationRegStepProps } from '@/shared/types/register/registerStepProps';
import { useOrgRegFormStore } from '@/store/useOrgRegFormStore';
import { verifyOtp } from '@/shared/lib/verifyOtp';
import {
  VerificationCodeInitialValues,
  VerificationCodeSchema,
} from '@/shared/validation/register/registerValidation';

const VerificationCode: React.FC<OrganizationRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  onResendCode,
  email,
}) => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.replace(/\D/g, '').slice(0, 4);

    if (digits.length === 4) {
      const newCode = digits.split('');
      setCode(newCode);
      inputRefs.current[3]?.focus();
    }
  };

  const { setData, data } = useOrgRegFormStore();

  const handleSubmit = async (
    values: typeof VerificationCodeInitialValues,
    actions: FormikHelpers<typeof VerificationCodeInitialValues>
  ) => {
    setData('step4', values);

    const email = data?.step2?.officialEmailAddress;
    const otp = values.code;

    if (!email) {
      actions.setSubmitting(false);
      return;
    }

    const res = await verifyOtp(otp, email);

    if (res.success) {
      if (onNext) onNext();
    } else {
      actions.setFieldError('code', res.message);
    }

    actions.setSubmitting(false);
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-4 py-6 sm:px-6 md:mt-6 md:min-h-[500px] md:max-w-[970px] md:rounded-[30px] md:px-[75px]"
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
        {({ setFieldValue, errors }) => {
          useEffect(() => {
            setFieldValue('code', code.join(''));
          }, [code, setFieldValue]);

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
                      key={index}
                      ref={el => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleInputChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
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
                    Didn't get OTP?{' '}
                    <button
                      type="button"
                      onClick={onResendCode}
                      className="font-medium text-[#0B0BB0] underline hover:text-[#0088cc]"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex w-full items-center gap-4 pt-8 sm:flex-row sm:justify-between">
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
          );
        }}
      </Formik>
    </div>
  );
};
export default VerificationCode;
