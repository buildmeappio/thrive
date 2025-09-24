// domains/auth/actions/submitExaminerApplication.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function submitExaminerApplication(payload: any) {
  try {
    return await handlers.submitExaminerApplication(payload);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to submit examiner application");
  }
}
