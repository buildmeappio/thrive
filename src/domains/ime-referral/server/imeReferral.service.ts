import prisma from '@/shared/lib/prisma';
import { type CreateIMEReferralData } from '../types/createIMEReferral';
import { getCurrentUser } from '@/domains/auth/server/session';
import { saveFileToStorage } from '@/shared/utils/imeCreation.utils';
import { HttpError } from '@/utils/httpError';

const createIMEReferralWithClaimant = async (data: CreateIMEReferralData) => {
  try {
    return await prisma.$transaction(async tx => {
      try {
        // Create address
        const address = await tx.address.create({
          data: {
            address: data.addressLookup,
            street: data.street || '',
            suite: data.apt || '',
            city: data.city || '',
            province: data.province || '',
            postalCode: data.postalCode || '',
          },
        });

        // Create claimant
        const claimant = await tx.claimant.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: new Date(data.dob),
            gender: data.gender,
            phoneNumber: data.phone,
            emailAddress: data.email,
            addressId: address.id,
          },
        });

        // Generate case number
        const caseNumber = `IME-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        // Get organization manager
        const organizationManager = await tx.organizationManager.findFirst({
          where: {
            accountId: currentUser.accountId,
          },
        });

        // Normalize relation helper function
        async function normalizeRelation(table: any, value: string) {
          try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            if (uuidRegex.test(value)) {
              return { connect: { id: value } };
            }

            let record = await table.findFirst({ where: { name: value } });

            if (!record) {
              record = await table.findFirst({
                where: { name: { equals: value.replace(/_/g, ' '), mode: 'insensitive' } },
              });
            }

            if (!record) {
              const existing = await table.findMany({ select: { id: true, name: true } });
              console.error(`❌ Invalid relation value: ${value}. Available:`, existing);
              throw new Error(`Invalid relation value: ${value}`);
            }

            return { connect: { id: record.id } };
          } catch (error) {
            console.error(`Error normalizing relation for value "${value}":`, error);
            throw new Error(`Failed to normalize relation for value "${value}"`);
          }
        }

        // Get normalized relations
        const caseTypeRelation = await normalizeRelation(tx.caseType, data.caseType);
        const examFormatRelation = await normalizeRelation(tx.examFormat, data.examFormat);
        const requestedSpecialtyRelation = await normalizeRelation(
          tx.requestedSpecialty,
          data.requestedSpecialty
        );

        // Create IME referral
        const imeReferral = await tx.iMEReferral.create({
          data: {
            caseNumber,
            examiner: { connect: { id: currentUser.accountId! } },
            organization: organizationManager?.organizationId
              ? { connect: { id: organizationManager.organizationId } }
              : undefined,
            claimant: { connect: { id: claimant.id } },
            caseType: caseTypeRelation,
            examFormat: examFormatRelation,
            requestedSpecialty: requestedSpecialtyRelation,
            reasonForReferral: data.reason,
            bodyPartConcern: data.urgencyLevel,
            preferredLocation: data.preferredLocation,
          },
        });

        // Handle file uploads and document creation
        const documentIds: string[] = [];
        for (const file of data.files) {
          try {
            await saveFileToStorage(file);

            const document = await tx.documents.create({
              data: {
                name: file.name,
                type: file.type,
                size: file.size,
              },
            });

            await tx.referralDocument.create({
              data: {
                referralId: imeReferral.id,
                documentId: document.id,
              },
            });

            documentIds.push(document.id);
          } catch (fileError) {
            console.log(fileError);
            throw new Error(`Failed to process file "${file.name}"`);
          }
        }

        return {
          referralId: imeReferral.id,
          claimantId: claimant.id,
          caseNumber,
          documentIds,
        };
      } catch (transactionError) {
        console.error('Transaction error:', transactionError);
        throw new Error(`Unable to create IME referral`);
      }
    });
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to create IME referral with claimant');
  }
};
const iMEReferralService = {
  createIMEReferralWithClaimant,
};

export default iMEReferralService;
