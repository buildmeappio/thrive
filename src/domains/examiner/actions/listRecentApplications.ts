"use server";

import applicationService from "../server/application.service";
import { ApplicationDto } from "../server/dto/application.dto";
import { ExaminerData } from "../types/ExaminerData";
import { HttpError } from "@/utils/httpError";
import { mapSpecialtyIdsToNames } from "../utils/mapSpecialtyIdsToNames";
import logger from "@/utils/logger";

const listRecentApplications = async (
  limit: number = 7,
): Promise<ExaminerData[]> => {
  try {
    // Get applications with status SUBMITTED or PENDING
    const applications = await applicationService.getRecentApplications(limit, [
      "SUBMITTED",
      "PENDING",
    ]);

    const applicationsData = ApplicationDto.toApplicationDataList(applications);

    // Map specialty IDs to exam type names
    const mappedData = await mapSpecialtyIdsToNames(applicationsData);

    return mappedData;
  } catch (error) {
    logger.error("Error fetching recent applications:", error);
    throw HttpError.fromError(error, "Failed to get recent applications");
  }
};

export default listRecentApplications;
