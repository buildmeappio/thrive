import checkUserExists from './checkUserExists';
import sendOtp from './sendOtp';
import verifyOtp from './verifyOtp';
import createMedicalExaminer from './createMedicalExaminer';
import approveMedicalExaminer from './approveMedicalExaminer';
import verifyAccountToken from './verifyAccountToken';
import setPassword from './setPassword';
import changePassword from './changePassword';
import forgotPassword from './forgotPassword';
import login from './login';
import getLanguages from './getLanguages';
import getExaminerProfileDetails from './getExaminerProfileDetails';
import updateMedicalExaminer from './updateMedicalExaminer';
import getYearsOfExperience from './getYearsOfExperience';
import getProfessionalTitles from './getProfessionalTitles';
import getMaxTravelDistances from './getMaxTravelDistances';
import getAssessmentTypes from './getAssessmentTypes';
import updateExaminerApplication from './updateExaminerApplication';
import saveApplicationProgress from './saveApplicationProgress';
import sendResumeLink from './sendResumeLink';
import verifyResumeToken from './verifyResumeToken';

const handlers = {
  checkUserExists,
  sendOtp,
  verifyOtp,
  createMedicalExaminer,
  approveMedicalExaminer,
  verifyAccountToken,
  setPassword,
  changePassword,
  forgotPassword,
  login,
  getLanguages,
  getExaminerProfileDetails,
  updateMedicalExaminer,
  updateExaminerApplication,
  getYearsOfExperience,
  getProfessionalTitles,
  getMaxTravelDistances,
  getAssessmentTypes,
  saveApplicationProgress,
  sendResumeLink,
  verifyResumeToken,
};

export default handlers;
