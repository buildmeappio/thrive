'use server';
import { forgotPassword } from '../server/handlers/forgotPassword';

const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const response = await forgotPassword({ email });
  return response;
};

export default forgotPasswordAction;
