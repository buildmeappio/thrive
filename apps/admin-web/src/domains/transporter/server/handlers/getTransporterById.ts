'use server';
import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import prisma from '@/lib/db';
import * as TransporterService from '../services/transporter.service';

export async function getTransporterById(id: string) {
  const tenantResult = await getTenantDbFromHeaders();
  const db = tenantResult?.prisma ?? prisma;
  return await TransporterService.getTransporterById(id, db);
}
