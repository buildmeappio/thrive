// Step 3
import { Formik, Form, type FormikHelpers } from 'formik';
import BackButton from '@/components/BackButton';
import ContinueButton from '@/components/ContinueButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRegistrationStore } from '@/store/useRegistration';
import { type OrganizationRegStepProps } from '@/types/registerStepProps';
import { sendOtp } from '../../actions';
import { ComplianceAccessInitialValues, ComplianceAccessSchema } from '../../schemas/register';
import Link from 'next/link';

const ComplianceAccess: React.FC<OrganizationRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { setData, data, _hasHydrated } = useRegistrationStore();

  if (!_hasHydrated) {
    return null;
  }

  const handleSubmit = async (
    values: typeof ComplianceAccessInitialValues,
    actions: FormikHelpers<typeof ComplianceAccessInitialValues>
  ) => {
    try {
      setData('step3', values);

      const email = data.step2?.officialEmailAddress;
      if (email) {
        await sendOtp(email);
      }

      actions.setSubmitting(false);

      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] md:mt-6 md:min-h-[450px] md:w-[970px] md:rounded-[30px] md:px-[75px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={data.step3 ?? ComplianceAccessInitialValues}
        validationSchema={ComplianceAccessSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize={true}
      >
        {({ values, errors, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="space-y-6 px-4 pb-8 md:px-0">
              <div className="mt-8 flex flex-col items-start justify-center space-y-12 md:mt-12 md:items-center">
                {/* Terms & Conditions Checkbox */}
                <div className="flex items-start space-x-3 md:items-center">
                  <Checkbox
                    disabled={isSubmitting}
                    id="agreeTermsConditions"
                    checked={values.agreeTermsConditions}
                    onCheckedChange={checked => setFieldValue('agreeTermsConditions', checked)}
                  />
                  <Label
                    htmlFor="agreeTermsConditions"
                    className="cursor-pointer text-xs leading-relaxed break-words text-black sm:text-sm"
                  >
                    Agree to{' '}
                    <Link
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-[#000093] underline hover:text-[#000093]"
                    >
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-[#000093] underline hover:text-[#000093]"
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
                {errors.agreeTermsConditions && (
                  <p className="-mt-2 text-xs text-red-500">{errors.agreeTermsConditions}</p>
                )}

                {/* Secure Data Handling Checkbox */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  isSubmitting={isSubmitting}
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
export default ComplianceAccess;
