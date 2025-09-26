import checkUserExists from "./checkUserExists";
import sendOtp from "./sendOtp";
import verifyOtp from "./verifyOtp";
import createMedicalExaminer from "./createMedicalExaminer";

const handlers = {
  checkUserExists,
  sendOtp,
  verifyOtp,
  createMedicalExaminer,
};

export default handlers;
