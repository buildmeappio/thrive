export type UserLoginFlags = {
  isActive: boolean;
  mustResetPassword: boolean;
  temporaryPasswordIssuedAt: Date | null;
};
