import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import userService from "../user.service";
import { HttpError } from "@/utils/httpError";

export const checkUser = async (req: NextRequest): Promise<boolean> => {
  const token = await getToken({ req: req });
  if (!token) {
    throw HttpError.unauthorized("Token not found", {
      code: "TOKEN_NOT_FOUND",
    });
  }
  const user = await userService.getUserById(token.id);
  if (!user) {
    throw HttpError.notFound("User not found", { code: "USER_NOT_FOUND" });
  }
  return true;
};
