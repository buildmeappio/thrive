"use server";

import prisma from './db';
import { Prisma } from '@prisma/client';

/**
 * Helper function to handle Prisma errors
 */
export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        throw new Error('A record with this value already exists');
      case 'P2025':
        throw new Error('Record not found');
      case 'P2003':
        throw new Error('Foreign key constraint failed');
      default:
        throw new Error(`Database error: ${error.message}`);
    }
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new Error(`Validation error: ${error.message}`);
  }
  
  // Re-throw unknown errors
  throw error;
}

/**
 * Helper to safely execute Prisma queries with error handling
 */
export async function safePrismaQuery<T>(
  queryFn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    handlePrismaError(error);
  }
}

/**
 * Helper to check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to disconnect Prisma (useful for cleanup)
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

