'use server';

import { revalidatePath } from 'next/cache';
import { FeeStructureStatus } from '@thrive/database';
import { getCurrentUser } from '@/domains/auth/server/session';
import prisma from '@/lib/db';
import { ActionResult } from '../types/feeStructure.types';

export const updateFeeStructureStatusAction = async (
  id: string,
  status: FeeStructureStatus
): Promise<ActionResult<{ id: string; status: FeeStructureStatus }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Invalid fee structure ID' };
    }

    const existing = await prisma.feeStructure.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'Fee structure not found' };
    }

    // Cannot change status of archived structures
    if (existing.status === FeeStructureStatus.ARCHIVED) {
      return {
        success: false,
        error: 'Cannot change status of archived fee structure',
      };
    }

    // Only allow switching between ACTIVE and DRAFT
    if (status !== FeeStructureStatus.ACTIVE && status !== FeeStructureStatus.DRAFT) {
      return {
        success: false,
        error: 'Invalid status. Only ACTIVE and DRAFT are allowed.',
      };
    }

    // If activating, validate the fee structure
    if (status === FeeStructureStatus.ACTIVE) {
      const feeStructure = await prisma.feeStructure.findUnique({
        where: { id },
        include: {
          variables: true,
        },
      });

      if (!feeStructure) {
        return { success: false, error: 'Fee structure not found' };
      }

      // Validate name
      if (!feeStructure.name || feeStructure.name.trim() === '') {
        return { success: false, error: 'Name is required' };
      }

      // Validate variables
      const keyRegex = /^[a-z][a-z0-9_]*$/;
      const seenKeys = new Set<string>();

      for (const variable of feeStructure.variables) {
        if (!keyRegex.test(variable.key)) {
          return {
            success: false,
            error: `Invalid variable key format: ${variable.key}`,
          };
        }

        if (seenKeys.has(variable.key)) {
          return {
            success: false,
            error: `Duplicate variable key: ${variable.key}`,
          };
        }
        seenKeys.add(variable.key);

        if (variable.required) {
          if (
            variable.defaultValue === null ||
            variable.defaultValue === undefined ||
            variable.defaultValue === ''
          ) {
            return {
              success: false,
              error: `Required variable ${variable.key} must have a default value`,
            };
          }
        }
      }
    }

    const updated = await prisma.feeStructure.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/dashboard/fee-structures');
    revalidatePath(`/dashboard/fee-structures/${id}`);

    return { success: true, data: { id: updated.id, status: updated.status } };
  } catch (error) {
    console.error('Error updating fee structure status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update fee structure status',
    };
  }
};
