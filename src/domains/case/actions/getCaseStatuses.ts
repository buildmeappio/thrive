import caseService from "../server/case.service";
import { HttpError } from "@/utils/httpError";

const getCaseStatuses = async () => {
  try {
    const statuses = await caseService.getStatuses();
    return statuses;
  } catch (error) {
    throw HttpError.fromError(error, "Failed to get case statuses");
  }
};

export default getCaseStatuses;
