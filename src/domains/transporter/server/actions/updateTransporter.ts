"use server";

import { updateTransporter as handlerUpdateTransporter } from "../handlers/updateTransporter";
import { UpdateTransporterData } from "../../types/TransporterData";

export async function updateTransporter(
  id: string,
  data: UpdateTransporterData
) {
  return await handlerUpdateTransporter(id, data);
}
