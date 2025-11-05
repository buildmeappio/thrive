"use server";

import { getTransporters as handlerGetTransporters } from "../handlers/getTransporters";

export async function getTransporters(page = 1, limit = 10, search = "") {
  return await handlerGetTransporters(page, limit, search);
}
