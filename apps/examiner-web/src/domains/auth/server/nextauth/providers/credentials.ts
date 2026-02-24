import CredentialsProvider from 'next-auth/providers/credentials';
import login from '@/domains/auth/server/handlers/login';
import ErrorMessages from '@/constants/ErrorMessages';
import { formatFullName } from '@/utils/text';

export const credentials = CredentialsProvider({
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(creds) {
    if (!creds?.email || !creds?.password) return null;
    const u = await login(creds.email, creds.password);
    if (!u) throw new Error(ErrorMessages.INVALID_CREDENTIALS);

    return {
      id: u.id,
      email: u.email,
      name: formatFullName(u.firstName, u.lastName),
      image: u.profilePhotoId,
      roleName: u.roleName,
      accountId: u.accountId,
      activationStep: u.activationStep,
    };
  },
});
