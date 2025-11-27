"use server";

import { completeTemporaryPassword } from "../server/handlers/completeTemporaryPassword";

type CompleteTemporaryPasswordInput = {
  password: string;
};

export const completeTemporaryPasswordAction = async (
  data: CompleteTemporaryPasswordInput
) => {
  return completeTemporaryPassword(data);
};

export default completeTemporaryPasswordAction;

