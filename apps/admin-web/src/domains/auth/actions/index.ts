import loginAction from './login';
import forgotPasswordAction from './forgotPassword';
import resetPasswordAction from './resetPassword';
import verifyPasswordResetTokenAction from './verifyPasswordResetToken';
import completeTemporaryPasswordAction from './completeTemporaryPassword';

const authActions = {
  login: loginAction,
  forgotPassword: forgotPasswordAction,
  resetPassword: resetPasswordAction,
  verifyPasswordResetToken: verifyPasswordResetTokenAction,
  completeTemporaryPassword: completeTemporaryPasswordAction,
};

export default authActions;
export {
  loginAction as login,
  forgotPasswordAction as forgotPassword,
  resetPasswordAction as resetPassword,
  verifyPasswordResetTokenAction as verifyPasswordResetToken,
  completeTemporaryPasswordAction as completeTemporaryPassword,
};
