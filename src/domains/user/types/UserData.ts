export type UserTableRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string | null;
  role: string;
  isActive: boolean;
  mustResetPassword: boolean;
  createdAt: string;
};
