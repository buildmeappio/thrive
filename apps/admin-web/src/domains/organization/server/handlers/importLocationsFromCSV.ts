'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { parseCSV } from '@/utils/csv';
import type { AddressFormData } from '@/types/address';

interface ImportResult {
  row: number;
  name: string;
  timezone: string;
  status: 'created' | 'updated' | 'error';
  error?: string;
  locationId?: string;
}

interface ImportLocationsResult {
  success: boolean;
  totalRows: number;
  successful: number;
  failed: number;
  created: number;
  updated: number;
  results: ImportResult[];
  errors: ImportResult[];
}

/**
 * Validate timezone format (IANA timezone)
 */
function isValidTimezone(timezone: string): boolean {
  if (!timezone || timezone.trim().length === 0) return false;
  // IANA timezone format: Continent/City or UTC
  const timezonePattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;
  return timezonePattern.test(timezone.trim()) || timezone.trim() === 'UTC';
}

/**
 * Validate Canadian postal code format
 */
function isValidPostalCode(postalCode: string): boolean {
  if (!postalCode) return false;
  const trimmed = postalCode.trim();
  // Canadian postal code format: A1A 1A1 or A1A1A1
  return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(trimmed);
}

/**
 * Parse boolean from CSV (handles "true", "false", "1", "0", "yes", "no")
 */
function parseBoolean(value: string | undefined): boolean {
  if (!value) return true; // Default to true
  const lower = value.trim().toLowerCase();
  return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'active';
}

/**
 * Import locations from CSV
 * Uses name + timezone as unique key (composite key)
 * If location exists (same name + timezone), updates it
 * If location doesn't exist, creates it
 */
const importLocationsFromCSV = async (
  organizationId: string,
  csvText: string,
  prisma: PrismaClient
): Promise<ImportLocationsResult> => {
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
        successful: 0,
        failed: 0,
        created: 0,
        updated: 0,
        results: [],
        errors: [
          {
            row: 0,
            name: '',
            timezone: '',
            status: 'error',
            error: 'CSV file is empty or invalid',
          },
        ],
      };
    }

    // Validate headers
    const requiredHeaders = ['name', 'timezone', 'addressLine1', 'city', 'state', 'postalCode'];
    const headers = Object.keys(rows[0] || {});
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        success: false,
        totalRows: rows.length,
        successful: 0,
        failed: rows.length,
        created: 0,
        updated: 0,
        results: [],
        errors: [
          {
            row: 0,
            name: '',
            timezone: '',
            status: 'error',
            error: `Missing required headers: ${missingHeaders.join(', ')}`,
          },
        ],
      };
    }

    const results: ImportResult[] = [];
    const errors: ImportResult[] = [];
    let createdCount = 0;
    let updatedCount = 0;

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

      try {
        // Extract and validate required fields
        const name = (row.name || '').trim();
        const timezone = (row.timezone || '').trim();
        const addressLine1 = (row.addressLine1 || '').trim();
        const city = (row.city || '').trim();
        const state = (row.state || '').trim();
        const postalCode = (row.postalCode || '').trim();

        // Optional fields
        const addressLine2 = (row.addressLine2 || '').trim();
        const isActive = parseBoolean(row.isActive);

        // Validate required fields
        if (!name || name.length < 2 || name.length > 255) {
          errors.push({
            row: rowNumber,
            name,
            timezone,
            status: 'error',
            error: 'Location name is required and must be between 2 and 255 characters',
          });
          continue;
        }

        if (!timezone || !isValidTimezone(timezone)) {
          errors.push({
            row: rowNumber,
            name,
            timezone,
            status: 'error',
            error: 'Valid timezone is required (IANA format, e.g., America/Toronto)',
          });
          continue;
        }

        if (!addressLine1 || addressLine1.length < 4 || addressLine1.length > 255) {
          errors.push({
            row: rowNumber,
            name,
            timezone,
            status: 'error',
            error: 'Address line 1 is required and must be between 4 and 255 characters',
          });
          continue;
        }

        if (!city || city.length < 4 || city.length > 100) {
          errors.push({
            row: rowNumber,
            name,
            timezone,
            status: 'error',
            error: 'City is required and must be between 4 and 100 characters',
          });
          continue;
        }

        if (!state || state.length === 0 || state.length > 100) {
          errors.push({
            row: rowNumber,
            name,
            timezone,
            status: 'error',
            error: 'State/Province is required and must be less than 100 characters',
          });
          continue;
        }

        if (!postalCode || postalCode.length === 0) {
          errors.push({
            row: rowNumber,
            name,
            timezone,
            status: 'error',
            error: 'Postal code is required',
          });
          continue;
        }

        // Validate postal code format (Canadian format only)
        if (!isValidPostalCode(postalCode)) {
          errors.push({
            row: rowNumber,
            name,
            timezone,
            status: 'error',
            error: 'Invalid postal code format. Must be Canadian format (e.g., A1A 1A1)',
          });
          continue;
        }

        // Build address JSON (country is always 'CA' for locations)
        const addressJson: AddressFormData = {
          line1: addressLine1,
          line2: addressLine2 || undefined,
          city,
          state,
          postalCode,
          country: 'CA',
        };

        // Check if location exists with same name + timezone (composite key)
        const existingLocation = await prisma.location.findFirst({
          where: {
            organizationId,
            name,
            timezone,
            deletedAt: null,
          },
        });

        if (existingLocation) {
          // UPDATE existing location
          const updatedLocation = await prisma.location.update({
            where: {
              id: existingLocation.id,
            },
            data: {
              addressJson: addressJson as any,
              isActive,
            },
          });

          updatedCount++;
          results.push({
            row: rowNumber,
            name,
            timezone,
            status: 'updated',
            locationId: updatedLocation.id,
          });
        } else {
          // CREATE new location
          const newLocation = await prisma.location.create({
            data: {
              organizationId,
              name,
              timezone,
              addressJson: addressJson as any,
              isActive,
            },
          });

          createdCount++;
          results.push({
            row: rowNumber,
            name,
            timezone,
            status: 'created',
            locationId: newLocation.id,
          });
        }
      } catch (error) {
        logger.error(`Error processing location row ${rowNumber}:`, error);
        errors.push({
          row: rowNumber,
          name: (row.name || '').trim(),
          timezone: (row.timezone || '').trim(),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: errors.length === 0,
      totalRows: rows.length,
      successful: results.length,
      failed: errors.length,
      created: createdCount,
      updated: updatedCount,
      results,
      errors,
    };
  } catch (error) {
    logger.error('Error importing locations from CSV:', error);
    return {
      success: false,
      totalRows: 0,
      successful: 0,
      failed: 0,
      created: 0,
      updated: 0,
      results: [],
      errors: [
        {
          row: 0,
          name: '',
          timezone: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to import locations',
        },
      ],
    };
  }
};

export default importLocationsFromCSV;
