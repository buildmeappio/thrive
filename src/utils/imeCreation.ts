import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/auth/server/nextauth/options';

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accountId) {
    return null;
  }

  return {
    accountId: session.user.accountId,
    userId: session.user.id,
    email: session.user.email,
  };
};

// need to change
export const saveFileToStorage = async (file: File): Promise<string> => {
  // const bytes = await file.arrayBuffer();
  // const buffer = Buffer.from(bytes);

  // const uploadDir = join(process.cwd(), 'uploads', 'referrals');
  // await mkdir(uploadDir, { recursive: true });

  // const filename = `${Date.now()}-${file.name}`;
  // const filepath = join(uploadDir, filename);

  // await writeFile(filepath, buffer);
  // return `/uploads/referrals/${filename}`;
  return file.name;
};

export const generateCaseNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `IME-${timestamp}-${random}`;
};
