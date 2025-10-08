"use server";
import examinerService from "../server/examiner.service";
import { ExaminerDto } from "../server/dto/examiner.dto";

const getExaminerById = async (id: string) => {
  const examiner = await examinerService.getExaminerById(id);
  return ExaminerDto.toExaminerData(examiner);
};

export default getExaminerById;

