"use server";

import { createTransporter as handlerCreateTransporter } from "../handlers/createTransporter";
import { CreateTransporterData } from "../../types/TransporterData";

export async function createTransporter(data: CreateTransporterData) {
  return await handlerCreateTransporter(data);
}
