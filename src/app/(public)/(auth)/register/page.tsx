import RegisterForm from '@/domains/auth/components/Register';
import getDepartments from '@/domains/auth/server/handlers/getDepartments';
import getOrganizationTypes from '@/domains/organization/server/handlers/getOrganizationTypes';
import { type Metadata } from 'next';
import { HttpError } from '@/utils/httpError';

export const metadata: Metadata = {
  title: 'Register | Thrive',
  description: 'Register yourself on Thrive',
};

export const dynamic = 'force-dynamic';

const RegisterPage = async () => {
  try {
    const [organizationTypes, departmentTypes] = await Promise.all([
      getOrganizationTypes(),
      getDepartments(),
    ]);
    return <RegisterForm organizationTypes={organizationTypes} departmentTypes={departmentTypes} />;
  } catch (error) {
    let message = 'Failed to load registration data';
    if (error instanceof HttpError) {
      message = error.message;
    }
    return <div>Error: {message}</div>;
  }
};

export default RegisterPage;
