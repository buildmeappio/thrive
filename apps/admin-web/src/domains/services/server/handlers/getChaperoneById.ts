import { PrismaClient } from '@thrive/database';
import * as chaperoneService from '../chaperone.service';

const getChaperoneById = async (id: string, db?: PrismaClient) => {
  const result = await chaperoneService.getChaperoneById(id, db);
  return { success: true, result };
};

export default getChaperoneById;
