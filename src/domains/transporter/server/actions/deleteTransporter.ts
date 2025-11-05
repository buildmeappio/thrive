"use server";

import { deleteTransporter as handlerDeleteTransporter } from "../handlers/deleteTransporter";

export async function deleteTransporter(id: string) {
  return await handlerDeleteTransporter(id);
}
