import examinerService from "../examiner.service";
import { ExaminerDto } from "../dto/examiner.dto";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";

export async function listRecentExaminers(limit = 7): Promise<ExaminerData[]> {
  const examiners = await examinerService.getRecentExaminers(limit, "PENDING");
  return ExaminerDto.toExaminerDataList(examiners);
}

