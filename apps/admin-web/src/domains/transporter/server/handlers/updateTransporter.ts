'use server';
import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import prisma from '@/lib/db';
import * as TransporterService from '../services/transporter.service';
import { UpdateTransporterData } from '../../types/TransporterData';

export async function updateTransporter(id: string, data: UpdateTransporterData) {
  const tenantResult = await getTenantDbFromHeaders();
  const db = tenantResult?.prisma ?? prisma;
  return await TransporterService.updateTransporter(id, data, db);
}
