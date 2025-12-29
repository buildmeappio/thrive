// Step 2
import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui';
import { Mail, User, Briefcase } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import BackButton from '@/components/BackButton';
import ContinueButton from '@/components/ContinueButton';
import { type OrganizationRegStepProps } from '@/types/registerStepProps';
import { useRegistrationStore } from '@/store/useRegistration';
import { checkUserByEmail } from '../../actions';
import { OfficeDetailsInitialValues, OfficeDetailsSchema } from '../../schemas/register';
import { useReactiveValidation } from '@/hooks/useReactiveValidation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useRouter from '@/hooks/useRouter';
import { URLS } from '@/constants/routes';
import PhoneInput from '@/components/PhoneNumber';
import { toast } from 'sonner';
import log from '@/utils/log';

interface DepartmentOption {
  value: string;
  label: string;
}

type OfficeDetailProps = OrganizationRegStepProps & {
  departmentTypes: DepartmentOption[];
  isUpdateMode?: boolean;
};

const OfficeDetails: React.FC<OfficeDetailProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  departmentTypes: departmentOptions,
  isUpdateMode = false,
}) => {
  const { setData, data, _hasHydrated } = useRegistrationStore();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const {
    attemptedSubmit,
    handleSubmitWithValidation,
    createReactiveChangeHandler,
    createReactiveBlurHandler,
    shouldShowError,
  } = useReactiveValidation<typeof OfficeDetailsInitialValues>();
  const router = useRouter();

  if (!_hasHydrated) {
    return null;
  }

  // Check if all required fields are filled
  const areAllRequiredFieldsFilled = (values: typeof OfficeDetailsInitialValues): boolean => {
    return !!(
      values.firstName?.trim() &&
      values.lastName?.trim() &&
      values.phoneNumber?.trim() &&
      values.officialEmailAddress?.trim() &&
      values.jobTitle?.trim() &&
      values.department
    );
  };

  const handleSubmit = async (
    values: typeof OfficeDetailsInitialValues,
    actions: FormikHelpers<typeof OfficeDetailsInitialValues>
  ) => {
    await handleSubmitWithValidation(values, actions, async (vals, helpers) => {
      try {
        // Skip email check in update mode since email cannot be changed
        if (!isUpdateMode) {
          log.debug('Checking email:', vals.officialEmailAddress);
          const result = await checkUserByEmail(vals.officialEmailAddress);

          if (!result.success) {
            throw new Error(result.error);
          }

          if (result.data) {
            setShowLoginPrompt(true);
            helpers.setSubmitting(false);
            return;
          }
        }

        setData('step2', vals);

        if (onNext) {
          onNext();
        }
      } catch (error) {
        log.error('Error in handleSubmit:', error);
        let message = 'An error occurred while submitting office details';
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        }
        toast.error(message);
        helpers.setSubmitting(false);
      }
    });
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-8 md:mt-6 md:min-h-[450px] md:w-[970px] md:rounded-[30px] md:px-[75px] md:pb-4"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={data.step2 ?? OfficeDetailsInitialValues}
        validationSchema={OfficeDetailsSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize={true}
      >
        {formik => {
          const {
            values,
            errors,
            handleChange,
            setFieldValue,
            isSubmitting,
            touched,
            setFieldTouched,
            validateField,
          } = formik;
          const isContinueDisabled = !areAllRequiredFieldsFilled(values);

          return (
            <Form noValidate>
              <div className="space-y-6 px-4 pb-4 md:px-0 md:pb-6">
                <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm text-black">
                      First Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      name="firstName"
                      icon={User}
                      placeholder="Lois"
                      value={values.firstName}
                      onChange={createReactiveChangeHandler('firstName', handleChange, formik)}
                      onBlur={createReactiveBlurHandler(
                        'firstName',
                        () => setFieldTouched('firstName', true),
                        formik
                      )}
                    />
                    {shouldShowError('firstName', touched, errors) && errors.firstName && (
                      <p className="text-xs text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm text-black">
                      Last Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      name="lastName"
                      icon={User}
                      placeholder="Becket"
                      value={values.lastName}
                      onChange={createReactiveChangeHandler('lastName', handleChange, formik)}
                      onBlur={createReactiveBlurHandler(
                        'lastName',
                        () => setFieldTouched('lastName', true),
                        formik
                      )}
                    />
                    {shouldShowError('lastName', touched, errors) && errors.lastName && (
                      <p className="text-xs text-red-500">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm text-black">
                      Phone Number<span className="text-red-500">*</span>
                    </Label>
                    <PhoneInput
                      disabled={isSubmitting}
                      name="phoneNumber"
                      value={values.phoneNumber}
                      onChange={createReactiveChangeHandler('phoneNumber', handleChange, formik)}
                      onBlur={createReactiveBlurHandler(
                        'phoneNumber',
                        () => setFieldTouched('phoneNumber', true),
                        formik
                      )}
                    />
                    {shouldShowError('phoneNumber', touched, errors) && errors.phoneNumber && (
                      <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="officialEmailAddress" className="text-sm text-black">
                      Official Email Address<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting || isUpdateMode}
                      name="officialEmailAddress"
                      icon={Mail}
                      type="email"
                      placeholder="lois@desjardins.com"
                      value={values.officialEmailAddress}
                      onChange={createReactiveChangeHandler(
                        'officialEmailAddress',
                        handleChange,
                        formik
                      )}
                      onBlur={createReactiveBlurHandler(
                        'officialEmailAddress',
                        () => setFieldTouched('officialEmailAddress', true),
                        formik
                      )}
                      className={isUpdateMode ? 'cursor-not-allowed bg-gray-100' : ''}
                    />
                    {shouldShowError('officialEmailAddress', touched, errors) &&
                      errors.officialEmailAddress && (
                        <p className="text-xs text-red-500">{errors.officialEmailAddress}</p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-sm text-black">
                      Job Title<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      name="jobTitle"
                      icon={Briefcase}
                      placeholder="Manager"
                      value={values.jobTitle}
                      onChange={createReactiveChangeHandler('jobTitle', handleChange, formik)}
                      onBlur={createReactiveBlurHandler(
                        'jobTitle',
                        () => setFieldTouched('jobTitle', true),
                        formik
                      )}
                    />
                    {shouldShowError('jobTitle', touched, errors) && errors.jobTitle && (
                      <p className="text-xs text-red-500">{errors.jobTitle}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Dropdown
                      id="department"
                      label="Department"
                      value={values.department}
                      onChange={async (value: string) => {
                        setFieldValue('department', value);
                        // Validate in real-time after attempted submit
                        if (attemptedSubmit) {
                          setFieldTouched('department', true);
                          const error = await validateField('department');
                          if (error === undefined) {
                            const currentErrors = { ...errors };
                            if (currentErrors.department) {
                              delete currentErrors.department;
                              formik.setErrors(currentErrors);
                            }
                          }
                        }
                      }}
                      options={departmentOptions}
                      required={true}
                      placeholder={'Select Department'}
                    />
                    {shouldShowError('department', touched, errors) && errors.department && (
                      <p className="text-xs text-red-500">{errors.department}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 mb-4 flex flex-row justify-between gap-4 px-4 md:mb-0 md:px-0">
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
            </Form>
          );
        }}
      </Formik>
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Already Exists</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This email is already registered. Would you like to log in instead?
          </p>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoginPrompt(false)}
              className="cursor-pointer rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={e => {
                e.preventDefault();
                setShowLoginPrompt(false);
                router.push(URLS.LOGIN);
              }}
              className="cursor-pointer rounded-lg bg-[#000093] hover:bg-[#000093]"
            >
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficeDetails;
