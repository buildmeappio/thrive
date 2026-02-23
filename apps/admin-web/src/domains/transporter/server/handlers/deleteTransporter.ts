"use server";
import * as TransporterService from "../services/transporter.service";

export async function deleteTransporter(id: string) {
  return await TransporterService.deleteTransporter(id);
}
