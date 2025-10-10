import checkUserExists from "./checkUserExists";
import sendOtp from "./sendOtp";
import verifyOtp from "./verifyOtp";
import createMedicalExaminer from "./createMedicalExaminer";
import approveMedicalExaminer from "./approveMedicalExaminer";
import verifyAccountToken from "./verifyAccountToken";
import setPassword from "./setPassword";
import login from "./login";
import getLanguages from "./getLanguages";

const handlers = {
  checkUserExists,
  sendOtp,
  verifyOtp,
  createMedicalExaminer,
  approveMedicalExaminer,
  verifyAccountToken,
  setPassword,
  login,
  getLanguages,
};

export default handlers;
