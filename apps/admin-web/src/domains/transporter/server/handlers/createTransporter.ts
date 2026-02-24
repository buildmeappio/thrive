import * as TransporterService from '../services/transporter.service';
import { CreateTransporterData } from '../../types/TransporterData';

export async function createTransporter(data: CreateTransporterData) {
  return await TransporterService.createTransporter(data);
}
