import checkUserExists from "./checkUserExists";
import sendOtp from "./sendOtp";
import verifyOtp from "./verifyOtp";
import createMedicalExaminer from "./createMedicalExaminer";
import approveMedicalExaminer from "./approveMedicalExaminer";

const handlers = {
  checkUserExists,
  sendOtp,
  verifyOtp,
  createMedicalExaminer,
  approveMedicalExaminer,
};

export default handlers;
