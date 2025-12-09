"use server";

import applicationService from "../server/application.service";

const getApplicationCount = async (): Promise<number> => {
  return applicationService.getApplicationCount();
};

export default getApplicationCount;

