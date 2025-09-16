import RegisterForm from '@/domains/auth/components/Register';
import getDepartments from '@/domains/auth/server/handlers/getDepartments';
import getOrganizationTypes from '@/domains/organization/server/handlers/getOrganizationTypes';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Thrive',
  description: 'Register yourself on Thrive',
};

export const dynamic = 'force-dynamic';

const RegisterPage = async () => {
  const [organizationTypes, departmentOptions] = await Promise.all([
    getOrganizationTypes(),
    getDepartments(),
  ]);
  return (
    <RegisterForm
      organizationTypes={organizationTypes.result}
      departmentTypes={departmentOptions.result}
    />
  );
};
export default RegisterPage;
