// Step 3
import { Formik, Form, type FormikHelpers } from 'formik';
import { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import ContinueButton from '@/components/ContinueButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '@/store/useRegistration';
import { type OrganizationRegStepProps } from '@/types/registerStepProps';
import { sendOtp, updateOrganizationData } from '../../actions';
import { ComplianceAccessInitialValues, ComplianceAccessSchema } from '../../schemas/register';
import Link from 'next/link';
import log from '@/utils/log';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const ComplianceAccess: React.FC<OrganizationRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  isUpdateMode = false,
  token,
}) => {
  const { setData, data, _hasHydrated, reset } = useRegistrationStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [pendingValues, setPendingValues] = useState<typeof ComplianceAccessInitialValues | null>(
    null
  );
  const [pendingActions, setPendingActions] = useState<FormikHelpers<
    typeof ComplianceAccessInitialValues
  > | null>(null);
  const router = useRouter();

  // Clear store and localStorage when success page is shown
  useEffect(() => {
    if (showSuccessPage) {
      // Clear the store
      reset();
      // Clear localStorage for registration form
      if (typeof window !== 'undefined') {
        localStorage.removeItem('registration-form');
      }
    }
  }, [showSuccessPage, reset]);

  if (!_hasHydrated) {
    return null;
  }

  // Check if all required fields are filled
  const areAllRequiredFieldsFilled = (values: typeof ComplianceAccessInitialValues): boolean => {
    return values.agreeTermsConditions === true;
  };

  const proceedToNextStep = async () => {
    if (!pendingValues || !pendingActions) return;

    try {
      setData('step3', pendingValues);

      // If in update mode (has token), update organization data and show success page
      if (isUpdateMode && token) {
        const updatedData = {
          ...data,
          step3: pendingValues,
        };

        const updateResult = await updateOrganizationData(token, updatedData);

        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Failed to update organization information');
        }

        toast.success(
          'Organization information updated successfully! Please wait for admin approval.'
        );
        setShowSuccessPage(true);
        pendingActions.setSubmitting(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      // Normal registration flow - send OTP and proceed to next step
      if (onNext) {
        onNext();
      }

      const email = data.step2?.officialEmailAddress;
      if (email) {
        const result = await sendOtp(email);
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      pendingActions.setSubmitting(false);
    } catch (error) {
      log.error('Error in proceedToNextStep:', error);
      let message = 'An error occurred while proceeding to the next step';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast.error(message);
      pendingActions.setSubmitting(false);
    }
  };

  const handleSubmit = async (
    values: typeof ComplianceAccessInitialValues,
    actions: FormikHelpers<typeof ComplianceAccessInitialValues>
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
        actions.setFieldTouched(field as keyof typeof ComplianceAccessInitialValues, true);
      });
      actions.setSubmitting(false);
      return;
    }

    // Store values and actions, then show confirmation dialog
    setPendingValues(values);
    setPendingActions(actions);
    setShowConfirmDialog(true);
    actions.setSubmitting(false);
  };

  const handleConfirmProceed = () => {
    setShowConfirmDialog(false);
    proceedToNextStep();
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingValues(null);
    setPendingActions(null);
  };

  // Show success page if in update mode and submission was successful
  if (showSuccessPage) {
    return (
      <div
        className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-8 md:min-h-[400px] md:w-[970px] md:rounded-[30px] md:px-[75px]"
        style={{
          boxShadow: '0px 0px 36.35px 0px #00000008',
        }}
      >
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Information Submitted Successfully
          </h2>
          <p className="mt-4 text-gray-600">
            Your organization information has been updated successfully. Please wait for admin
            approval.
          </p>
          <p className="mt-2 text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-8 md:min-h-[400px] md:w-[970px] md:rounded-[30px] md:px-[75px]"
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
          {({ values, errors, setFieldValue, isSubmitting, touched }) => {
            const isContinueDisabled = !areAllRequiredFieldsFilled(values);
            const showErrors = attemptedSubmit || Object.keys(touched).length > 0;

            return (
              <Form>
                <div className="space-y-6 px-4 pb-4 md:px-0 md:pb-6">
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
                        className="cursor-pointer break-words text-xs leading-relaxed text-black sm:text-sm"
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
                    {showErrors && errors.agreeTermsConditions && (
                      <p className="-mt-2 text-xs text-red-500">{errors.agreeTermsConditions}</p>
                    )}

                    {/* Secure Data Handling Checkbox */}
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        disabled={isSubmitting}
                        id="consentSecureDataHandling"
                        checked={values.consentSecureDataHandling}
                        onCheckedChange={checked =>
                          setFieldValue('consentSecureDataHandling', checked)
                        }
                      />
                      <Label
                        htmlFor="consentSecureDataHandling"
                        className="cursor-pointer text-sm leading-relaxed text-black"
                      >
                        I consent to secure data handling
                      </Label>
                    </div>
                    {showErrors && errors.consentSecureDataHandling && (
                      <p className="-mt-2 text-xs text-red-500">
                        {errors.consentSecureDataHandling}
                      </p>
                    )}

                    {/* Authorization Checkbox */}
                    <div className="flex items-start space-x-3 md:items-center">
                      <Checkbox
                        disabled={isSubmitting}
                        id="authorizedToCreateAccount"
                        checked={values.authorizedToCreateAccount}
                        onCheckedChange={checked =>
                          setFieldValue('authorizedToCreateAccount', checked)
                        }
                      />
                      <Label
                        htmlFor="authorizedToCreateAccount"
                        className="cursor-pointer text-sm leading-relaxed text-black"
                      >
                        I am authorized to create this account on behalf of my organization
                      </Label>
                    </div>
                    {showErrors && errors.authorizedToCreateAccount && (
                      <p className="-mt-2 text-xs text-red-500">
                        {errors.authorizedToCreateAccount}
                      </p>
                    )}
                  </div>

                  <div className="mt-20 flex flex-row justify-between gap-4 px-4 md:mt-32 md:px-0">
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Details</DialogTitle>
            <DialogDescription>
              If you continue, you will not be able to go back now. Please confirm your details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer rounded-lg" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="cursor-pointer rounded-lg bg-[#000093] hover:bg-[#000093]"
              onClick={handleConfirmProceed}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ComplianceAccess;
