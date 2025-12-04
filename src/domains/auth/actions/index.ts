import checkUserExists from "./checkUserExists";
import resendOtp from "./resendOtp";
import verifyOtp from "./verifyOtp";
import createMedicalExaminer from "./createMedicalExaminer";
import getLanguages from "./getLanguages";
import approveMedicalExaminer from "./approveMedicalExaminer";
import verifyAccountToken from "./verifyAccountToken";
import setPassword from "./setPassword";
import changePassword from "./changePassword";
import forgotPassword from "./forgotPassword";
import getExaminerProfileDetails from "./getExaminerProfileDetails";
import updateMedicalExaminer from "./updateMedicalExaminer";
import getYearsOfExperience from "./getYearsOfExperience";
import getMaxTravelDistances from "./getMaxTravelDistances";
import sendRegistrationEmails from "./sendRegistrationEmails";

const authActions = {
  checkUserExists,
  resendOtp,
  verifyOtp,
  createMedicalExaminer,
  getLanguages,
  approveMedicalExaminer,
  verifyAccountToken,
  setPassword,
  changePassword,
  forgotPassword,
  getExaminerProfileDetails,
  updateMedicalExaminer,
  getYearsOfExperience,
  getMaxTravelDistances,
  sendRegistrationEmails,
};

export default authActions;
