"use server";

import { markContractAsViewedHandler } from "../handlers/markContractAsViewed";

export const markContractAsViewed = async (
  contractId: string,
  accountId: string,
) => {
  const result = await markContractAsViewedHandler(contractId, accountId);
  return result;
};
