import HttpError from "@/utils/httpError";
import { verifyExaminerInfoToken } from "@/lib/jwt";
import { examinerService } from "../services";
import ErrorMessages from "@/constants/ErrorMessages";

export type GetExaminerProfileDetailsInput = {
  token: string;
};

const getExaminerProfileDetails = async (
  payload: GetExaminerProfileDetailsInput
) => {
  // Verify token
  const decoded = verifyExaminerInfoToken(payload.token);

  if (!decoded) {
    throw HttpError.unauthorized(ErrorMessages.INVALID_EXAMINER_INFO_TOKEN);
  }

  const examinerId = decoded.examinerId as string;

  // Fetch examiner profile with all details
  const examinerProfile = await examinerService.getExaminerProfileWithDetails(
    examinerId
  );

  return {
    success: true,
    data: {
      examinerProfile,
      tokenData: {
        email: decoded.email as string,
        userId: decoded.userId as string,
        accountId: decoded.accountId as string,
        examinerId: decoded.examinerId as string,
      },
    },
  };
};

export default getExaminerProfileDetails;
