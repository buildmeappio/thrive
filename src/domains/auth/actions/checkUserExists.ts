"use server";
import HttpError from "@/utils/httpError";
import handlers from "../server/handlers";

const checkUserExists = async (email: string) => {
  try {
    return await handlers.checkUserExists(email);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to check user exists", 500);
  }
};

export default checkUserExists;
