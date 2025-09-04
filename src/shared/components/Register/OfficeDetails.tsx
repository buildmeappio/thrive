// Step 2
import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/shared/components/ui';
import { Mail, Phone, User, Briefcase } from 'lucide-react';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { type OrganizationRegStepProps } from '@/shared/types/register/registerStepProps';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { checkUserEmailAction } from '@/features/organization.actions';
import {
  OfficeDetailsInitialValues,
  OfficeDetailsSchema,
} from '@/shared/validation/register/registerValidation';
import ErrorMessages from '@/constants/ErrorMessages';

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
  const [submitting, setSubmitting] = useState(false);
  const { setData, data } = useRegistrationStore();

  const handleSubmit = async (
    values: typeof OfficeDetailsInitialValues,
    actions: FormikHelpers<typeof OfficeDetailsInitialValues>
  ) => {
    try {
      setSubmitting(true);
      const exists = await checkUserEmailAction(values.officialEmailAddress);

      if (exists) {
        actions.setFieldError('officialEmailAddress', ErrorMessages.EMAIL_ALREADY_EXISTS);
        return;
      }

      setData('step2', values);

      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
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
      >
        {({ values, errors, handleChange, setFieldValue }) => (
          <Form>
            <div className="space-y-6 px-4 pb-8 md:px-0">
              <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-black">
                    First Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
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
                  <Input
                    name="phoneNumber"
                    icon={Phone}
                    type="tel"
                    placeholder="(555) 123-4567"
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
              />
              <ContinueButton
                isSubmitting={submitting}
                isLastStep={currentStep === totalSteps}
                color="#000080"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OfficeDetails;
