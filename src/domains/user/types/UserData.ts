export type UserTableRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string | null;
  role: string;
  isLoginEnabled: boolean;
  mustResetPassword: boolean;
  createdAt: string;
};

