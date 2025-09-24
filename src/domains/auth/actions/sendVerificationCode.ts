// domains/auth/actions/sendVerificationCode.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function sendVerificationCode(email: string) {
    try {
        return await handlers.sendVerificationCode({
            email,
            ttlMinutes: 5
        });
    } catch (e) {
        throw HttpError.fromError(e, "Failed to send verification code");
    }
}
