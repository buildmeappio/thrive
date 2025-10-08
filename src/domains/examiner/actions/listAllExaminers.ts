"use server";
import examinerService from "../server/examiner.service";
import { ExaminerDto } from "../server/dto/examiner.dto";

const listAllExaminers = async () => {
  // Get all examiners (pending ones) without limit
  const examiners = await examinerService.getRecentExaminers(1000, "PENDING");
  return ExaminerDto.toExaminerDataList(examiners);
};

export default listAllExaminers;

