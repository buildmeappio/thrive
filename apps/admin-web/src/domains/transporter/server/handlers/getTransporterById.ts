'use server';
import * as TransporterService from '../services/transporter.service';

export async function getTransporterById(id: string) {
  return await TransporterService.getTransporterById(id);
}
