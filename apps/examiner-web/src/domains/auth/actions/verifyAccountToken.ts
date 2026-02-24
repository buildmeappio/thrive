'use server';

import { VerifyAccountTokenInput } from '../server/handlers/verifyAccountToken';
import authHandlers from '../server/handlers/index';

const verifyAccountToken = async (payload: VerifyAccountTokenInput) => {
  const result = await authHandlers.verifyAccountToken(payload);
  return result;
};

export default verifyAccountToken;
