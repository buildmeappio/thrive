import { getTransporterById as handlerGetTransporterById } from '../handlers/getTransporterById';

export async function getTransporterById(id: string) {
  return await handlerGetTransporterById(id);
}
