import { PrismaClient } from '@thrive/database';
import * as chaperoneService from '../chaperone.service';

const deleteChaperone = async (id: string, db?: PrismaClient) => {
  const result = await chaperoneService.deleteChaperone(id, db);
  return { success: true, result };
};

export default deleteChaperone;
