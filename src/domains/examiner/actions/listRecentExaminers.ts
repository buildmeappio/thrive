"use server";
import { listRecentExaminers as listRecentExaminersHandler } from "../server/handlers/listRecentExaminers";

const listRecentExaminers = async (limit = 7) => {
  return listRecentExaminersHandler(limit);
};

export default listRecentExaminers;

