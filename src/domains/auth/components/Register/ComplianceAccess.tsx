// Step 3
import { Formik, Form, type FormikHelpers } from 'formik';
import { useState } from 'react';
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
import { sendOtp } from '../../actions';
import { ComplianceAccessInitialValues, ComplianceAccessSchema } from '../../schemas/register';
import Link from 'next/link';
import log from '@/utils/log';
import { toast } from 'sonner';

const ComplianceAccess: React.FC<OrganizationRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { setData, data, _hasHydrated } = useRegistrationStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<typeof ComplianceAccessInitialValues | null>(
    null
  );
  const [pendingActions, setPendingActions] = useState<FormikHelpers<
    typeof ComplianceAccessInitialValues
  > | null>(null);

  if (!_hasHydrated) {
    return null;
  }

  const proceedToNextStep = async () => {
    if (!pendingValues || !pendingActions) return;

    try {
      setData('step3', pendingValues);
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

  return (
    <>
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
                  {errors.consentSecureDataHandling && (
                    <p className="-mt-2 text-xs text-red-500">{errors.consentSecureDataHandling}</p>
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
