import examinerService from "../examiner.service";
import { ExaminerDto } from "../dto/examiner.dto";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { mapSpecialtyIdsToNames } from "../../utils/mapSpecialtyIdsToNames";

export async function listRecentExaminers(limit = 7): Promise<ExaminerData[]> {
  const examiners = await examinerService.getRecentExaminers(limit, "PENDING");
  const examinersData = ExaminerDto.toExaminerDataList(examiners);

  // Map specialty IDs to exam type names for all examiners
  return await mapSpecialtyIdsToNames(examinersData);
}
