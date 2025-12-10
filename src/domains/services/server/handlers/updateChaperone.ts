import { UpdateChaperoneInput } from "../../types/Chaperone";
import * as chaperoneService from "../chaperone.service";

const updateChaperone = async (id: string, data: UpdateChaperoneInput) => {
  const result = await chaperoneService.updateChaperone(id, data);
  return { success: true, result };
};

export default updateChaperone;

