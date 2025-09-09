import { authHandlers } from '@/domains/auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const credentials = CredentialsProvider({
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(values) {
    if (!values?.email || !values?.password) return null;

    const user = await authHandlers.login({ email: values.email, password: values.password });

    return user;
  },
});
