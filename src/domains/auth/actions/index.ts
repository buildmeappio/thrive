import checkUserExists from "./checkUserExists";
import resendOtp from "./resendOtp";
import verifyOtp from "./verifyOtp";
import createMedicalExaminer from "./createMedicalExaminer";
import getLanguages from "./getLanguages";

const authActions = {
  checkUserExists,
  resendOtp,
  verifyOtp,
  createMedicalExaminer,
  getLanguages,
};

export default authActions;
