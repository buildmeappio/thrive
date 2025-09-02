// Step 2  
import { Formik, Form, FormikHelpers } from 'formik';
import {
  step2OfficeDetailsInitialValues,
  step2OfficeDetailsSchema,
} from '@/features/organization/organization.schema';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/shared/components/ui';
import { Mail, Phone, User, Briefcase } from 'lucide-react';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { OrganizationRegStepProps } from '@/shared/types/register/registerStepProps';
import { useOrgRegFormStore } from '@/store/useOrgRegFormStore';
import { checkOrganizationEmailAction } from '@/features/organization/organization.actions';

// Department options
const departmentOptions = [
  { value: 'legal', label: 'Legal' },
  { value: 'claims', label: 'Claims' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'medical', label: 'Medical' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'administration', label: 'Administration' },
  { value: 'other', label: 'Other' },
];

const OfficeDetails: React.FC<OrganizationRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { setData, data } = useOrgRegFormStore();

  const handleSubmit = async (
    values: typeof step2OfficeDetailsInitialValues,
    actions: FormikHelpers<typeof step2OfficeDetailsInitialValues>
  ) => {
    const exists = await checkOrganizationEmailAction(values.officialEmailAddress);

    if (exists) {
      actions.setFieldError(
        'officialEmailAddress',
        'This email is already associated with an organization.'
      );
      return;
    }

    setData('step2', values);

    if (onNext) {
      onNext();
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[450px] md:w-[970px] md:rounded-[30px] md:px-[75px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <Formik
        initialValues={data.step2 ?? step2OfficeDetailsInitialValues}
        validationSchema={step2OfficeDetailsSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, handleChange, setFieldValue, submitForm }) => (
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
                    placeholder="lois@desjardins.com"
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
                    placeholder="Select Department"
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