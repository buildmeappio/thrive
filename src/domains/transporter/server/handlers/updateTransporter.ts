import { TransporterService } from "../services/transporter.service";
import { UpdateTransporterData } from "../../types/TransporterData";

export async function updateTransporter(
  id: string,
  data: UpdateTransporterData
) {
  return await TransporterService.update(id, data);
}
