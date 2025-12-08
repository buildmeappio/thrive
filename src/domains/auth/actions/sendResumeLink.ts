"use server";

import { SendResumeLinkInput } from "../server/handlers/sendResumeLink";
import authHandlers from "../server/handlers/index";

const sendResumeLink = async (payload: SendResumeLinkInput) => {
  try {
    const result = await authHandlers.sendResumeLink(payload);
    return result;
  } catch (error: any) {
    console.error("Error in sendResumeLink action:", error);
    return {
      success: false,
      message:
        error?.message ||
        "Failed to send resume link. Please try again.",
    };
  }
};

export default sendResumeLink;

