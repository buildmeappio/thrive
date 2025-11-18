import loginAction from "./login";
import forgotPasswordAction from "./forgotPassword";
import resetPasswordAction from "./resetPassword";
import verifyPasswordResetTokenAction from "./verifyPasswordResetToken";

export default {
  login: loginAction,
  forgotPassword: forgotPasswordAction,
  resetPassword: resetPasswordAction,
  verifyPasswordResetToken: verifyPasswordResetTokenAction,
};
