"use server";
import HttpError from "@/utils/httpError";
import handlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";

const checkUserExists = async (email: string) => {
  try {
    return await handlers.checkUserExists(email);
  } catch (e) {
    throw HttpError.fromError(e, ErrorMessages.FAILED_CHECK_USER_EXISTS, 500);
  }
};

export default checkUserExists;
