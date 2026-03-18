'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { parseCSV } from '@/utils/csv';
import bcrypt from 'bcryptjs';
import { getE164PhoneNumber, validateCanadianPhoneNumber } from '@/utils/phoneNumber';
import { Roles } from '@/domains/auth/constants/roles';
import { AccountStatus } from '@thrive/database';
import emailService from '@/services/email.service';
import { ENV } from '@/constants/variables';

interface ImportResult {
  row: number;
  email: string;
  status: 'success' | 'error';
  error?: string;
  userId?: string;
}

interface ImportUsersResult {
  success: boolean;
  totalRows: number;
  successful: number;
  failed: number;
  results: ImportResult[];
  errors: ImportResult[];
}

/**
 * Generate a secure temporary password
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate name format (2-100 chars, valid pattern)
 */
function isValidName(name: string): boolean {
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return false;
  }
  const namePattern = /^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/;
  return namePattern.test(name.trim());
}

/**
 * Validate and process role from CSV
 */
async function validateAndProcessRole(
  roleName: string | undefined,
  organizationId: string,
  rowNumber: number,
  email: string,
  prisma: PrismaClient
): Promise<{ success: boolean; roleId?: string; error?: string }> {
  try {
    // Role is optional - if not provided, return success without roleId
    if (!roleName || roleName.trim().length === 0) {
      return { success: true };
    }

    const trimmedRoleName = roleName.trim();

    // Find role in organization
    const role = await prisma.organizationRole.findFirst({
      where: {
        organizationId,
        name: trimmedRoleName,
        deletedAt: null,
      },
    });

    if (role) {
      // Don't allow SUPER_ADMIN role assignment via CSV
      if (role.key === 'SUPER_ADMIN') {
        return {
          success: false,
          error: `Row ${rowNumber} (${email}): Super Admin role cannot be assigned via CSV import. Please use the super admin invitation flow instead.`,
        };
      }
      return { success: true, roleId: role.id };
    }

    return {
      success: false,
      error: `Row ${rowNumber} (${email}): Role "${trimmedRoleName}" not found in organization`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Row ${rowNumber} (${email}): Failed to process role - ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Import users from CSV
 */
const importUsersFromCSV = async (
  organizationId: string,
  csvText: string,
  prisma: PrismaClient
): Promise<ImportUsersResult> => {
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
        results: [],
        errors: [
          {
            row: 0,
            email: '',
            status: 'error',
            error: 'CSV file is empty or invalid',
          },
        ],
      };
    }

    // Validate headers
    const requiredHeaders = ['email', 'firstName', 'lastName', 'phoneNumber'];
    const headers = Object.keys(rows[0] || {});
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        success: false,
        totalRows: rows.length,
        successful: 0,
        failed: rows.length,
        results: [],
        errors: [
          {
            row: 0,
            email: '',
            status: 'error',
            error: `Missing required headers: ${missingHeaders.join(', ')}`,
          },
        ],
      };
    }

    const results: ImportResult[] = [];
    const errors: ImportResult[] = [];

    // Get Organization Manager role
    const orgManagerRole = await prisma.role.findFirst({
      where: { name: Roles.ORGANIZATION_MANAGER },
    });

    if (!orgManagerRole) {
      throw new HttpError(404, 'Organization Manager role not found');
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed
      const email = row.email?.trim().toLowerCase() || '';

      try {
        // Validate email
        if (!email || !isValidEmail(email)) {
          errors.push({
            row: rowNumber,
            email: email || 'N/A',
            status: 'error',
            error: 'Invalid email format',
          });
          continue;
        }

        // Validate firstName
        const firstName = row.firstName?.trim() || '';
        if (!isValidName(firstName)) {
          errors.push({
            row: rowNumber,
            email,
            status: 'error',
            error:
              'First name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes',
          });
          continue;
        }

        // Validate lastName
        const lastName = row.lastName?.trim() || '';
        if (!isValidName(lastName)) {
          errors.push({
            row: rowNumber,
            email,
            status: 'error',
            error:
              'Last name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes',
          });
          continue;
        }

        // Validate and format phoneNumber
        const phoneNumber = row.phoneNumber?.trim() || '';
        if (!phoneNumber) {
          errors.push({
            row: rowNumber,
            email,
            status: 'error',
            error: 'Phone number is required',
          });
          continue;
        }

        // Try to format the phone number
        let e164Phone = getE164PhoneNumber(phoneNumber);

        // If formatting fails, try validating if it's a valid Canadian number
        if (!e164Phone) {
          const digitsOnly = phoneNumber.replace(/\D/g, '');

          // If it's exactly 10 digits, try adding +1 prefix
          if (digitsOnly.length === 10) {
            e164Phone = getE164PhoneNumber(`+1${digitsOnly}`);
          }

          // If still no result, validate if it's a valid Canadian number
          if (!e164Phone) {
            if (!validateCanadianPhoneNumber(phoneNumber)) {
              errors.push({
                row: rowNumber,
                email,
                status: 'error',
                error: 'Invalid Canadian phone number format',
              });
              continue;
            }
            errors.push({
              row: rowNumber,
              email,
              status: 'error',
              error: 'Failed to format phone number',
            });
            continue;
          }
        }

        // Validate and process role (optional)
        const roleResult = await validateAndProcessRole(
          row.role,
          organizationId,
          rowNumber,
          email,
          prisma
        );

        if (!roleResult.success) {
          errors.push({
            row: rowNumber,
            email,
            status: 'error',
            error: roleResult.error || 'Failed to process role',
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          // Check if user already has an account in this organization
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              managers: {
                some: {
                  organizationId,
                  deletedAt: null,
                },
              },
            },
            include: {
              managers: {
                where: {
                  organizationId,
                  deletedAt: null,
                },
                include: {
                  organizationRole: true,
                },
                take: 1,
              },
            },
          });

          if (existingAccount && existingAccount.managers.length > 0) {
            const existingManager = existingAccount.managers[0];

            // Update role if provided and different
            if (roleResult.roleId && existingManager.organizationRoleId !== roleResult.roleId) {
              await prisma.organizationManager.update({
                where: { id: existingManager.id },
                data: {
                  organizationRoleId: roleResult.roleId,
                },
              });
              results.push({
                row: rowNumber,
                email,
                status: 'success',
                userId: existingUser.id,
              });
            }
            continue;
          }
        }

        // Check if there's already a pending invitation
        const existingInvitation = await prisma.organizationInvitation.findFirst({
          where: {
            organizationId,
            email,
            deletedAt: null,
            acceptedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

        if (existingInvitation) {
          continue; // Skip silently
        }

        // Generate temporary password
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // Create user in transaction
        const result = await prisma.$transaction(async tx => {
          // Create or update user
          let user = existingUser;
          if (!user) {
            user = await tx.user.create({
              data: {
                firstName,
                lastName,
                email,
                phone: e164Phone,
                password: hashedPassword,
                status: 'PENDING',
                mustResetPassword: true,
                temporaryPasswordIssuedAt: new Date(),
                userType: 'ORGANIZATION_USER',
                organizationId,
              },
            });
          } else {
            user = await tx.user.update({
              where: { id: user.id },
              data: {
                firstName,
                lastName,
                phone: e164Phone,
                password: hashedPassword,
                status: 'PENDING',
                mustResetPassword: true,
                temporaryPasswordIssuedAt: new Date(),
                userType: 'ORGANIZATION_USER',
                organizationId,
              },
            });
          }

          // Create account if it doesn't exist
          let account = await tx.account.findFirst({
            where: {
              userId: user.id,
              roleId: orgManagerRole.id,
            },
          });

          if (!account) {
            account = await tx.account.create({
              data: {
                userId: user.id,
                roleId: orgManagerRole.id,
                status: AccountStatus.ACTIVE,
              },
            });
          } else {
            if (account.status !== AccountStatus.ACTIVE) {
              account = await tx.account.update({
                where: { id: account.id },
                data: {
                  status: AccountStatus.ACTIVE,
                },
              });
            }
          }

          // Create organization manager
          let organizationManagerRecord = await tx.organizationManager.findFirst({
            where: {
              accountId: account.id,
              organizationId,
              deletedAt: null,
            },
          });

          if (!organizationManagerRecord) {
            organizationManagerRecord = await tx.organizationManager.create({
              data: {
                organizationId,
                accountId: account.id,
                organizationRoleId: roleResult.roleId || null,
                jobTitle: null,
                departmentId: null,
              },
            });
          } else {
            organizationManagerRecord = await tx.organizationManager.update({
              where: { id: organizationManagerRecord.id },
              data: {
                organizationRoleId: roleResult.roleId || undefined,
              },
            });
          }

          return { user, temporaryPassword };
        });

        // Send email with credentials
        const loginUrl = `${ENV.NEXT_PUBLIC_APP_URL}/organization/login`;
        const emailResult = await emailService.sendEmail(
          'Your Thrive Account Credentials',
          'user-credentials.html',
          {
            email: result.user.email,
            temporaryPassword: result.temporaryPassword,
            loginUrl,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            cdnUrl: ENV.NEXT_PUBLIC_CDN_URL,
            year: new Date().getFullYear().toString(),
          },
          result.user.email
        );

        if (!emailResult.success) {
          const errorMessage = 'error' in emailResult ? emailResult.error : 'Unknown error';
          logger.error(`Failed to send email to ${email}:`, errorMessage);
        }

        results.push({
          row: rowNumber,
          email,
          status: 'success',
          userId: result.user.id,
        });
      } catch (error) {
        logger.error(`Error processing row ${rowNumber}:`, error);
        errors.push({
          row: rowNumber,
          email: email || 'N/A',
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
      results,
      errors,
    };
  } catch (error) {
    logger.error('Error importing users from CSV:', error);
    return {
      success: false,
      totalRows: 0,
      successful: 0,
      failed: 0,
      results: [],
      errors: [
        {
          row: 0,
          email: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to import users',
        },
      ],
    };
  }
};

export default importUsersFromCSV;
