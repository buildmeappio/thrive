import * as chaperoneService from "../chaperone.service";

const deleteChaperone = async (id: string) => {
  const result = await chaperoneService.deleteChaperone(id);
  return { success: true, result };
};

export default deleteChaperone;
