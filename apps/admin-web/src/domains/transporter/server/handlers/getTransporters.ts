'use server';

import { PrismaClient } from '@thrive/database';
import prisma from '@/lib/db';
import * as TransporterService from '../services/transporter.service';

function getDb(db?: PrismaClient) {
  return db ?? prisma;
}

export async function getTransporters(page = 1, limit = 10, search = '', db?: PrismaClient) {
  const client = getDb(db);
  return await TransporterService.getTransporters(page, limit, search, client);
}
