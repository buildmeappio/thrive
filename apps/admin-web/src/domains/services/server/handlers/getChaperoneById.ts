import * as chaperoneService from '../chaperone.service';

const getChaperoneById = async (id: string) => {
  const result = await chaperoneService.getChaperoneById(id);
  return { success: true, result };
};

export default getChaperoneById;
