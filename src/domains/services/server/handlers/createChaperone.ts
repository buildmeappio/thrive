import { CreateChaperoneInput } from "../../types/Chaperone";
import chaperoneService from "../chaperone.service";

const createChaperone = async (data: CreateChaperoneInput) => {
  const result = await chaperoneService.createChaperone(data);
  return { success: true, result };
};

export default createChaperone;

