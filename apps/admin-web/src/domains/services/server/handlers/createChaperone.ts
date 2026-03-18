import { PrismaClient } from '@thrive/database';
import { CreateChaperoneInput } from '../../types/Chaperone';
import * as chaperoneService from '../chaperone.service';

const createChaperone = async (data: CreateChaperoneInput, db?: PrismaClient) => {
  const result = await chaperoneService.createChaperone(data, db);
  return { success: true, result };
};

export default createChaperone;
