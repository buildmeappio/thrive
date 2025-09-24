// domains/auth/actions/getLinkedAccountForApplication.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function getLinkedAccountForApplication(applicationId: string) {
  try {
    return await handlers.getLinkedAccountForApplication(applicationId);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to load linked account");
  }
}
