import checkUserExists from './checkUserExists';
import resendOtp from './resendOtp';
import verifyOtp from './verifyOtp';
import createMedicalExaminer from './createMedicalExaminer';
import getLanguages from './getLanguages';
import getAssessmentTypes from './getAssessmentTypes';
import approveMedicalExaminer from './approveMedicalExaminer';
import verifyAccountToken from './verifyAccountToken';
import setPassword from './setPassword';
import changePassword from './changePassword';
import forgotPassword from './forgotPassword';
import getExaminerProfileDetails from './getExaminerProfileDetails';
import updateMedicalExaminer from './updateMedicalExaminer';
import updateExaminerApplication from './updateExaminerApplication';
import getYearsOfExperience from './getYearsOfExperience';
import getProfessionalTitles from './getProfessionalTitles';
import getMaxTravelDistances from './getMaxTravelDistances';
import sendRegistrationEmails from './sendRegistrationEmails';
import saveApplicationProgress from './saveApplicationProgress';
import sendResumeLink from './sendResumeLink';
import verifyResumeToken from './verifyResumeToken';

const authActions = {
  checkUserExists,
  resendOtp,
  verifyOtp,
  createMedicalExaminer,
  getLanguages,
  getAssessmentTypes,
  approveMedicalExaminer,
  verifyAccountToken,
  setPassword,
  changePassword,
  forgotPassword,
  getExaminerProfileDetails,
  updateMedicalExaminer,
  updateExaminerApplication,
  getYearsOfExperience,
  getProfessionalTitles,
  getMaxTravelDistances,
  sendRegistrationEmails,
  saveApplicationProgress,
  sendResumeLink,
  verifyResumeToken,
};

export default authActions;
