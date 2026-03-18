import { PrismaClient } from '@thrive/database';
import { UpdateChaperoneInput } from '../../types/Chaperone';
import * as chaperoneService from '../chaperone.service';

const updateChaperone = async (id: string, data: UpdateChaperoneInput, db?: PrismaClient) => {
  const result = await chaperoneService.updateChaperone(id, data, db);
  return { success: true, result };
};

export default updateChaperone;
