'use server';

import { SendResumeLinkInput } from '../server/handlers/sendResumeLink';
import authHandlers from '../server/handlers/index';

const sendResumeLink = async (payload: SendResumeLinkInput) => {
  try {
    const result = await authHandlers.sendResumeLink(payload);
    return result;
  } catch (error: unknown) {
    console.error('Error in sendResumeLink action:', error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        'Failed to send resume link. Please try again.',
    };
  }
};

export default sendResumeLink;
