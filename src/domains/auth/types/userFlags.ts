export type UserLoginFlags = {
  isLoginEnabled: boolean;
  mustResetPassword: boolean;
  temporaryPasswordIssuedAt: Date | null;
};

