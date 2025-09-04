import RegisterForm from '@/shared/components/Register';
import { type Metadata } from 'next';
import { getDepartmentAction, getOrganizationTypeAction } from '@/features/organization.actions';

export const metadata: Metadata = {
  title: 'Register | Thrive',
  description: 'Register yourself on Thrive',
};
const RegisterPage = async () => {
  const [organizationTypes, departmentOptions] = await Promise.all([
    getOrganizationTypeAction(),
    getDepartmentAction(),
  ]);
  return (
    <RegisterForm
      organizationTypes={organizationTypes.result}
      departmentTypes={departmentOptions.result}
    />
  );
};
export default RegisterPage;
