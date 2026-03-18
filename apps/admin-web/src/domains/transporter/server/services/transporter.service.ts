'use server';
import { PrismaClient } from '@thrive/database';
import prisma from '@/lib/db';
import {
  CreateTransporterData,
  UpdateTransporterData,
  TransporterData,
} from '../../types/TransporterData';
import logger from '@/utils/logger';

function getDb(db?: PrismaClient) {
  return db ?? prisma;
}

export async function createTransporter(data: CreateTransporterData, db?: PrismaClient) {
  try {
    const client = getDb(db);
    const transporter = await client.transporter.create({
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        serviceAreas: JSON.parse(JSON.stringify(data.serviceAreas)),
      },
    });

    // Transform Prisma result to TransporterData
    const transformed: TransporterData = {
      ...transporter,
      serviceAreas: transporter.serviceAreas as unknown as TransporterData['serviceAreas'],
    };

    return { success: true, data: transformed };
  } catch (error) {
    logger.error('Error creating transporter:', error);
    return { success: false, error: 'Failed to create transporter' };
  }
}

export async function getTransporters(page = 1, limit = 10, search = '', db?: PrismaClient) {
  try {
    const client = getDb(db);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              companyName: { contains: search, mode: 'insensitive' as const },
            },
            {
              contactPerson: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const [transporters, total] = await Promise.all([
      client.transporter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      client.transporter.count({ where }),
    ]);

    // Transform Prisma results to TransporterData
    const transformed: TransporterData[] = transporters.map(t => ({
      ...t,
      serviceAreas: t.serviceAreas as unknown as TransporterData['serviceAreas'],
    }));

    return {
      success: true,
      data: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching transporters:', error);
    return { success: false, error: 'Failed to fetch transporters' };
  }
}

export async function getTransporterById(id: string, db?: PrismaClient) {
  try {
    const client = getDb(db);
    const transporter = await client.transporter.findUnique({
      where: { id, deletedAt: null },
    });

    if (!transporter) {
      return { success: false, error: 'Transporter not found' };
    }

    // Transform Prisma result to TransporterData
    const transformed: TransporterData = {
      ...transporter,
      serviceAreas: transporter.serviceAreas as unknown as TransporterData['serviceAreas'],
    };

    return { success: true, data: transformed };
  } catch (error) {
    logger.error('Error fetching transporter:', error);
    return { success: false, error: 'Failed to fetch transporter' };
  }
}

export async function updateTransporter(
  id: string,
  data: UpdateTransporterData,
  db?: PrismaClient
) {
  try {
    logger.log('TransporterService.update called with:', { id, data });
    const client = getDb(db);
    const transporter = await client.transporter.update({
      where: { id },
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        serviceAreas: data.serviceAreas ? JSON.parse(JSON.stringify(data.serviceAreas)) : undefined,
        status: data.status,
        updatedAt: new Date(),
      },
    });

    // Transform Prisma result to TransporterData
    const transformed: TransporterData = {
      ...transporter,
      serviceAreas: transporter.serviceAreas as unknown as TransporterData['serviceAreas'],
    };

    logger.log('Transporter updated successfully:', transporter);
    return { success: true, data: transformed };
  } catch (error) {
    logger.error('Error updating transporter:', error);
    return { success: false, error: 'Failed to update transporter' };
  }
}

export async function deleteTransporter(id: string, db?: PrismaClient) {
  try {
    const client = getDb(db);
    await client.transporter.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  } catch (error) {
    logger.error('Error deleting transporter:', error);
    return { success: false, error: 'Failed to delete transporter' };
  }
}
