'use server';
import prisma from '@/lib/db';
import { ExaminerStatus } from '@thrive/database';
import { ApplicationDto } from '../server/dto/application.dto';
import { HttpError } from '@/utils/httpError';
import { mapSpecialtyIdsToNames } from '../utils/mapSpecialtyIdsToNames';
import logger from '@/utils/logger';

const listAllApplications = async () => {
  try {
    // Get all applications with status from SUBMITTED/PENDING till APPROVED
    // Include APPROVED applications as records (even if they have examiner profiles)
    // Exclude ACTIVE (those are examiners), REJECTED, and WITHDRAWN
    const applications = await prisma.examinerApplication.findMany({
      where: {
        deletedAt: null,
        status: {
          in: [
            ExaminerStatus.SUBMITTED,
            ExaminerStatus.PENDING,
            ExaminerStatus.IN_REVIEW,
            ExaminerStatus.MORE_INFO_REQUESTED,
            ExaminerStatus.INTERVIEW_REQUESTED,
            ExaminerStatus.INTERVIEW_SCHEDULED,
            ExaminerStatus.INTERVIEW_COMPLETED,
            ExaminerStatus.CONTRACT_SENT,
            ExaminerStatus.CONTRACT_SIGNED,
            ExaminerStatus.APPROVED,
          ],
        },
        // Keep all applications including APPROVED as records, even if they have examiner profiles
      },
      include: {
        address: true,
        resumeDocument: true,
        ndaDocument: true,
        insuranceDocument: true,
        redactedIMEReportDocument: true,
        interviewSlots: {
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const applicationsData = ApplicationDto.toApplicationDataList(applications);

    // Map specialty IDs to exam type names for all applications
    const mappedData = await mapSpecialtyIdsToNames(applicationsData);

    // If any yearsOfIMEExperience looks like a UUID, fetch the actual names from the taxonomy table
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    const yearsUuids = new Set<string>();

    for (const application of applications) {
      if (
        application.yearsOfIMEExperience &&
        uuidRegex.test(application.yearsOfIMEExperience.replace(/\s/g, ''))
      ) {
        yearsUuids.add(application.yearsOfIMEExperience);
      }
    }

    if (yearsUuids.size > 0) {
      try {
        const yearsOfExperienceRecords = await prisma.yearsOfExperience.findMany({
          where: { id: { in: Array.from(yearsUuids) } },
        });

        const yearsMap = new Map(yearsOfExperienceRecords.map(y => [y.id, y.name]));

        for (let i = 0; i < mappedData.length; i++) {
          const applicationData = mappedData[i];
          const originalApplication = applications[i];
          if (
            originalApplication.yearsOfIMEExperience &&
            uuidRegex.test(originalApplication.yearsOfIMEExperience.replace(/\s/g, ''))
          ) {
            const yearName = yearsMap.get(originalApplication.yearsOfIMEExperience);
            if (yearName) {
              applicationData.yearsOfIMEExperience = yearName;
            }
          }
        }
      } catch (error) {
        logger.error('Failed to fetch years of experience:', error);
      }
    }

    // Map assessment types if they are UUIDs
    const assessmentTypeUuids = new Set<string>();
    for (const application of applications) {
      if (application.assessmentTypeIds) {
        application.assessmentTypeIds.forEach(typeId => {
          if (uuidRegex.test(typeId.replace(/\s/g, ''))) {
            assessmentTypeUuids.add(typeId);
          }
        });
      }
    }

    if (assessmentTypeUuids.size > 0) {
      try {
        const assessmentTypes = await prisma.assessmentType.findMany({
          where: {
            id: { in: Array.from(assessmentTypeUuids) },
            deletedAt: null,
          },
        });

        const typeMap = new Map(assessmentTypes.map(t => [t.id, t.name]));

        for (let i = 0; i < mappedData.length; i++) {
          const applicationData = mappedData[i];
          const originalApplication = applications[i];
          if (
            originalApplication.assessmentTypeIds &&
            originalApplication.assessmentTypeIds.length > 0
          ) {
            applicationData.assessmentTypes = originalApplication.assessmentTypeIds.map(
              id => typeMap.get(id) || id
            );
          }
        }
      } catch (error) {
        logger.error('Failed to map assessment types:', error);
      }
    }

    return mappedData;
  } catch (error) {
    logger.error('Error fetching all applications:', error);
    throw HttpError.fromError(error, 'Failed to get applications');
  }
};

export default listAllApplications;
