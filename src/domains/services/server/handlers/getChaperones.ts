import chaperoneService from "../chaperone.service";

const getChaperones = async () => {
  const result = await chaperoneService.getChaperones();
  return { success: true, result };
};

export default getChaperones;

