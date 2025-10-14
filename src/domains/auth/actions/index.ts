import checkUserExists from "./checkUserExists";
import resendOtp from "./resendOtp";
import verifyOtp from "./verifyOtp";
import createMedicalExaminer from "./createMedicalExaminer";
import getLanguages from "./getLanguages";
import approveMedicalExaminer from "./approveMedicalExaminer";
import verifyAccountToken from "./verifyAccountToken";
import setPassword from "./setPassword";
import getExaminerProfileDetails from "./getExaminerProfileDetails";
import updateMedicalExaminer from "./updateMedicalExaminer";

const authActions = {
  checkUserExists,
  resendOtp,
  verifyOtp,
  createMedicalExaminer,
  getLanguages,
  approveMedicalExaminer,
  verifyAccountToken,
  setPassword,
  getExaminerProfileDetails,
  updateMedicalExaminer,
};

export default authActions;
