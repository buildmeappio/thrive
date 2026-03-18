import { PrismaClient } from '@thrive/database';
import * as TransporterService from '../services/transporter.service';
import { CreateTransporterData } from '../../types/TransporterData';

export async function createTransporter(data: CreateTransporterData, db?: PrismaClient) {
  return await TransporterService.createTransporter(data, db);
}
