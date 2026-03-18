'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { parseCSV } from '@/utils/csv';
import { generateRoleKey } from '@/domains/organization/utils/generateRoleKey';
import { z } from 'zod';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

interface ImportResult {
  row: number;
  name: string;
  status: 'created' | 'updated' | 'error' | 'skipped';
  roleId?: string;
  error?: string;
}

interface ImportRolesResult {
  success: boolean;
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  results: ImportResult[];
  errors: ImportResult[];
}

// Define a Zod schema for the CSV row
const csvRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(255, 'Role name must be 255 characters or less'),
  description: z.string().optional().or(z.literal('')),
});

type CSVRoleRow = z.infer<typeof csvRoleSchema>;

/**
 * Check if role key is SUPER_ADMIN
 */
function isSuperAdminRole(key: string): boolean {
  return key === 'SUPER_ADMIN';
}

/**
 * Import roles from CSV
 * Uses name as unique key - if role exists, updates it
 * If role doesn't exist, creates it
 * Skips SUPER_ADMIN role
 */
const importRolesFromCSV = async (
  organizationId: string,
  csvText: string,
  prisma: PrismaClient
): Promise<ImportRolesResult> => {
  try {
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId, deletedAt: null },
    });

    if (!organization) {
      throw new HttpError(404, 'Organization not found');
    }

    // Parse CSV
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return {
        success: false,
        totalRows: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        results: [],
        errors: [
          {
            row: 0,
            name: '',
            status: 'error',
            error: 'CSV file is empty or invalid',
          },
        ],
      };
    }

    const results: ImportResult[] = [];
    const errors: ImportResult[] = [];
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Keep track of role names within the CSV to detect duplicates
    const csvRoleNames = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rowData = rows[i];
      const rowNumber = i + 1;
      let parsedRow: CSVRoleRow | undefined;

      try {
        parsedRow = csvRoleSchema.parse(rowData);

        const normalizedName = parsedRow.name.trim();

        // Check for duplicates within CSV
        if (csvRoleNames.has(normalizedName.toLowerCase())) {
          errors.push({
            row: rowNumber,
            name: normalizedName,
            status: 'error',
            error: `Duplicate role name "${normalizedName}" found in CSV`,
          });
          continue;
        }
        csvRoleNames.add(normalizedName.toLowerCase());

        // Generate role key
        const roleKey = generateRoleKey(normalizedName);

        // Skip SUPER_ADMIN role
        if (isSuperAdminRole(roleKey)) {
          skippedCount++;
          results.push({
            row: rowNumber,
            name: normalizedName,
            status: 'skipped',
            error: 'SUPER_ADMIN role cannot be imported',
          });
          continue;
        }

        // Check if role exists by name
        const existingRole = await prisma.organizationRole.findFirst({
          where: {
            organizationId,
            name: normalizedName,
            deletedAt: null,
          },
        });

        if (existingRole) {
          // Check if existing role is SUPER_ADMIN
          if (isSuperAdminRole(existingRole.key)) {
            skippedCount++;
            results.push({
              row: rowNumber,
              name: normalizedName,
              status: 'skipped',
              error: 'SUPER_ADMIN role cannot be updated',
            });
            continue;
          }

          // Update existing role
          const updatedRole = await prisma.organizationRole.update({
            where: { id: existingRole.id },
            data: {
              description: parsedRow.description?.trim() || null,
            },
          });
          updatedCount++;
          results.push({
            row: rowNumber,
            name: updatedRole.name,
            status: 'updated',
            roleId: updatedRole.id,
          });
        } else {
          // Check if role with same key exists
          const existingRoleByKey = await prisma.organizationRole.findFirst({
            where: {
              organizationId,
              key: roleKey,
              deletedAt: null,
            },
          });

          if (existingRoleByKey) {
            // Update by key if name is different
            if (isSuperAdminRole(existingRoleByKey.key)) {
              skippedCount++;
              results.push({
                row: rowNumber,
                name: normalizedName,
                status: 'skipped',
                error: 'SUPER_ADMIN role cannot be updated',
              });
              continue;
            }

            const updatedRole = await prisma.organizationRole.update({
              where: { id: existingRoleByKey.id },
              data: {
                name: normalizedName,
                description: parsedRow.description?.trim() || null,
              },
            });
            updatedCount++;
            results.push({
              row: rowNumber,
              name: updatedRole.name,
              status: 'updated',
              roleId: updatedRole.id,
            });
          } else {
            // Create new role
            const newRole = await prisma.organizationRole.create({
              data: {
                organizationId,
                name: normalizedName,
                key: roleKey,
                description: parsedRow.description?.trim() || null,
                isDefault: false,
              },
            });
            createdCount++;
            results.push({
              row: rowNumber,
              name: newRole.name,
              status: 'created',
              roleId: newRole.id,
            });
          }
        }
      } catch (error) {
        logger.error(`Error processing role row ${rowNumber}:`, error);
        let errorMessage: string = 'Failed to create role';

        if (error instanceof z.ZodError) {
          // Extract validation errors from Zod
          const validationErrors = error.issues.map(issue => {
            if (issue.path.includes('name')) {
              if (issue.code === 'too_small') return 'Role name is required';
              if (issue.code === 'too_big') return 'Role name must be 255 characters or less';
              return 'Invalid role name';
            }
            return issue.message;
          });
          errorMessage = validationErrors.join(', ');
        } else if (error instanceof HttpError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          if (
            error.message.includes('Unique constraint') ||
            error.message.includes('duplicate') ||
            error.message.includes('unique')
          ) {
            errorMessage = 'Role already exists';
          } else {
            errorMessage = error.message || 'Failed to create role';
          }
        }

        errors.push({
          row: rowNumber,
          name: parsedRow?.name || rowData.name || 'N/A',
          status: 'error',
          error: errorMessage,
        });
      }
    }

    return {
      success: errors.length === 0,
      totalRows: rows.length,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      results,
      errors,
    };
  } catch (error) {
    logger.error('Error importing roles from CSV:', error);
    return {
      success: false,
      totalRows: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      results: [],
      errors: [
        {
          row: 0,
          name: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to import roles from CSV',
        },
      ],
    };
  }
};

export default importRolesFromCSV;
