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
import getYearsOfExperience from "./getYearsOfExperience";
import getMaxTravelDistances from "./getMaxTravelDistances";

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
  getYearsOfExperience,
  getMaxTravelDistances,
};

export default authActions;
