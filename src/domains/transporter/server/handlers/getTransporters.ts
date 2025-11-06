import { TransporterService } from "../services/transporter.service";

export async function getTransporters(page = 1, limit = 10, search = "") {
  return await TransporterService.getMany(page, limit, search);
}
