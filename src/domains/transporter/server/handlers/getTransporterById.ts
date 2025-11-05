import { TransporterService } from "../services/transporter.service";

export async function getTransporterById(id: string) {
  return await TransporterService.getById(id);
}
