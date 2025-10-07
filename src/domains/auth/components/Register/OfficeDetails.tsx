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

interface DepartmentOption {
  value: string;
  label: string;
}

type OfficeDetailProps = OrganizationRegStepProps & {
  departmentTypes: DepartmentOption[];
};

const OfficeDetails: React.FC<OfficeDetailProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  departmentTypes: departmentOptions,
}) => {
  const { setData, data, _hasHydrated } = useRegistrationStore();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  if (!_hasHydrated) {
    return null;
  }

  const handleSubmit = async (
    values: typeof OfficeDetailsInitialValues,
    actions: FormikHelpers<typeof OfficeDetailsInitialValues>
  ) => {
    try {
      console.log('Checking email:', values.officialEmailAddress);
      const exists = await checkUserByEmail(values.officialEmailAddress);
      console.log('Email exists:', exists);

      if (exists) {
        setShowLoginPrompt(true);
        actions.setSubmitting(false);
        return;
      }

      setData('step2', values);

      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      actions.setSubmitting(false);
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
        initialValues={data.step2 ?? OfficeDetailsInitialValues}
        validationSchema={OfficeDetailsSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize={true}
      >
        {({ values, errors, handleChange, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="space-y-6 px-4 pb-8 md:px-0">
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
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
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
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm text-black">
                    Phone Number<span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    disabled={isSubmitting}
                    name="phoneNumber"
                    value={values.phoneNumber}
                    onChange={handleChange}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officialEmailAddress" className="text-sm text-black">
                    Official Email Address<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={isSubmitting}
                    name="officialEmailAddress"
                    icon={Mail}
                    type="email"
                    placeholder="lois@desjardins.com"
                    value={values.officialEmailAddress}
                    onChange={handleChange}
                  />
                  {errors.officialEmailAddress && (
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
                    onChange={handleChange}
                  />
                  {errors.jobTitle && <p className="text-xs text-red-500">{errors.jobTitle}</p>}
                </div>

                <div className="space-y-2">
                  <Dropdown
                    id="department"
                    label="Department"
                    value={values.department}
                    onChange={(value: string) => setFieldValue('department', value)}
                    options={departmentOptions}
                    required={true}
                    placeholder={'Select Department'}
                  />
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>
              </div>
            </div>

            <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
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
          </Form>
        )}
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
