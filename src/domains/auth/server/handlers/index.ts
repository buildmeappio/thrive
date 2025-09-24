// domains/auth/server/handlers/index.ts
import submitExaminerApplication from "./submitExaminerApplication";
import adminCreateInvite from "./adminCreateInvite";
import consumeInviteAndSetPassword from "./consumeInviteAndSetPassword";
import login from "./login";
import sendVerificationCode from "./sendVerificationCode";
import verifyCode from "./verifyCode";
import changePassword from "./changePassword";
import forgotPasswordRequest from "./forgotPasswordRequest";
import forgotPasswordConfirm from "./forgotPasswordConfirm";
import getLinkedAccountForApplication from "./getLinkedAccountForApplication";

const handlers = {
  submitExaminerApplication,
  adminCreateInvite,
  consumeInviteAndSetPassword,
  login,
  sendVerificationCode,
  verifyCode,
  changePassword,
  forgotPasswordRequest,
  forgotPasswordConfirm,
  getLinkedAccountForApplication,
};

export default handlers;
