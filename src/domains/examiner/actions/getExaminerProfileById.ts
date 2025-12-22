"use server";
import prisma from "@/lib/db";
import { ExaminerProfileDto } from "../server/dto/examiner-profile.dto";
import { HttpError } from "@/utils/httpError";
import { generatePresignedUrl } from "@/lib/s3";
import logger from "@/utils/logger";

const getExaminerProfileById = async (id: string) => {
  try {
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id, deletedAt: null },
      include: {
        account: {
          include: {
            user: {
              include: {
                profilePhoto: true,
              },
            },
          },
        },
        governmentIdDocument: true,
        resumeDocument: true,
        insuranceDocument: true,
      },
    });

    if (!examinerProfile) {
      throw HttpError.notFound("Examiner profile not found");
    }

    // Fetch availability provider data
    const availabilityProvider = await prisma.availabilityProvider.findFirst({
      where: {
        refId: id,
        providerType: "EXAMINER",
        deletedAt: null,
      },
      include: {
        weeklyHours: {
          include: {
            timeSlots: {
              orderBy: { startTime: "asc" },
            },
          },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    // Fetch medical license documents and generate presigned URLs
    let medicalLicenseUrls: string[] = [];
    let medicalLicenseNames: string[] = [];
    if (
      examinerProfile.medicalLicenseDocumentIds &&
      examinerProfile.medicalLicenseDocumentIds.length > 0
    ) {
      try {
        const medicalLicenseDocs = await prisma.documents.findMany({
          where: {
            id: { in: examinerProfile.medicalLicenseDocumentIds },
            deletedAt: null,
          },
        });

        const urlsAndNames = await Promise.all(
          medicalLicenseDocs.map(async (doc) => {
            try {
              const url = await generatePresignedUrl(
                `examiner/${doc.name}`,
                3600,
              );
              return { url, name: doc.name };
            } catch (error) {
              logger.error(
                `Failed to generate presigned URL for medical license ${doc.id}:`,
                error,
              );
              return null;
            }
          }),
        );

        const validDocs = urlsAndNames.filter(
          (item): item is { url: string; name: string } => item !== null,
        );
        medicalLicenseUrls = validDocs.map((d) => d.url);
        medicalLicenseNames = validDocs.map((d) => d.name);
      } catch (error) {
        logger.error("Failed to fetch medical license documents:", error);
      }
    }

    // Fetch specialty certificates documents and generate presigned URLs
    let specialtyCertificatesUrls: string[] = [];
    let specialtyCertificatesNames: string[] = [];
    if (
      examinerProfile.specialtyCertificatesDocumentIds &&
      examinerProfile.specialtyCertificatesDocumentIds.length > 0
    ) {
      try {
        const specialtyCertsDocs = await prisma.documents.findMany({
          where: {
            id: { in: examinerProfile.specialtyCertificatesDocumentIds },
            deletedAt: null,
          },
        });

        const urlsAndNames = await Promise.all(
          specialtyCertsDocs.map(async (doc) => {
            try {
              const url = await generatePresignedUrl(
                `examiner/${doc.name}`,
                3600,
              );
              return { url, name: doc.name };
            } catch (error) {
              logger.error(
                `Failed to generate presigned URL for specialty certificate ${doc.id}:`,
                error,
              );
              return null;
            }
          }),
        );

        const validDocs = urlsAndNames.filter(
          (item): item is { url: string; name: string } => item !== null,
        );
        specialtyCertificatesUrls = validDocs.map((d) => d.url);
        specialtyCertificatesNames = validDocs.map((d) => d.name);
      } catch (error) {
        logger.error(
          "Failed to fetch specialty certificates documents:",
          error,
        );
      }
    }

    // Generate presigned URLs for single documents
    let governmentIdUrl: string | undefined;
    let governmentIdName: string | undefined;
    if (examinerProfile.governmentIdDocument) {
      try {
        governmentIdUrl = await generatePresignedUrl(
          `examiner/${examinerProfile.governmentIdDocument.name}`,
          3600,
        );
        governmentIdName = examinerProfile.governmentIdDocument.name;
      } catch (error) {
        logger.error(
          "Failed to generate presigned URL for government ID:",
          error,
        );
      }
    }

    let resumeUrl: string | undefined;
    let resumeName: string | undefined;
    if (examinerProfile.resumeDocument) {
      try {
        resumeUrl = await generatePresignedUrl(
          `examiner/${examinerProfile.resumeDocument.name}`,
          3600,
        );
        resumeName = examinerProfile.resumeDocument.name;
      } catch (error) {
        logger.error("Failed to generate presigned URL for resume:", error);
      }
    }

    let insuranceUrl: string | undefined;
    let insuranceName: string | undefined;
    if (examinerProfile.insuranceDocument) {
      try {
        insuranceUrl = await generatePresignedUrl(
          `examiner/${examinerProfile.insuranceDocument.name}`,
          3600,
        );
        insuranceName = examinerProfile.insuranceDocument.name;
      } catch (error) {
        logger.error("Failed to generate presigned URL for insurance:", error);
      }
    }

    let profilePhotoUrl: string | undefined;
    if (examinerProfile.account.user.profilePhoto) {
      try {
        profilePhotoUrl = await generatePresignedUrl(
          `examiner/${examinerProfile.account.user.profilePhoto.name}`,
          3600,
        );
      } catch (error) {
        logger.error(
          "Failed to generate presigned URL for profile photo:",
          error,
        );
      }
    }

    // Map to DTO
    const examinerProfileData = ExaminerProfileDto.toExaminerProfileData(
      {
        ...examinerProfile,
        availabilityProvider: availabilityProvider || null,
        governmentIdDocument: examinerProfile.governmentIdDocument || null,
        resumeDocument: examinerProfile.resumeDocument || null,
        insuranceDocument: examinerProfile.insuranceDocument || null,
        account: {
          ...examinerProfile.account,
          user: {
            ...examinerProfile.account.user,
            profilePhoto: examinerProfile.account.user.profilePhoto || null,
          },
        },
      },
      medicalLicenseUrls,
      specialtyCertificatesUrls,
      governmentIdUrl,
      resumeUrl,
      insuranceUrl,
      profilePhotoUrl,
      medicalLicenseNames,
      specialtyCertificatesNames,
      governmentIdName,
      resumeName,
      insuranceName,
    );

    // Map yearsOfIMEExperience UUID to name
    const uuidRegex =
      /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (
      examinerProfile.yearsOfIMEExperience &&
      uuidRegex.test(examinerProfile.yearsOfIMEExperience.replace(/\s/g, ""))
    ) {
      try {
        const yearsOfExperience = await prisma.yearsOfExperience.findUnique({
          where: { id: examinerProfile.yearsOfIMEExperience },
        });
        if (yearsOfExperience) {
          examinerProfileData.yearsOfIMEExperience = yearsOfExperience.name;
        }
      } catch (error) {
        logger.error("Failed to fetch years of experience:", error);
      }
    }

    // Map assessment type UUIDs to names
    if (
      examinerProfile.assessmentTypes &&
      examinerProfile.assessmentTypes.length > 0
    ) {
      const assessmentTypeIds = examinerProfile.assessmentTypes.filter((id) =>
        uuidRegex.test(id.replace(/\s/g, "")),
      );

      if (assessmentTypeIds.length > 0) {
        try {
          const assessmentTypes = await prisma.assessmentType.findMany({
            where: {
              id: { in: assessmentTypeIds },
              deletedAt: null,
            },
          });

          const typeMap = new Map(assessmentTypes.map((t) => [t.id, t.name]));
          examinerProfileData.assessmentTypes =
            examinerProfile.assessmentTypes.map((id) => typeMap.get(id) || id);
        } catch (error) {
          logger.error("Failed to map assessment types:", error);
        }
      }
    }

    // Map professionalTitle UUID to name and description
    if (
      examinerProfile.professionalTitle &&
      uuidRegex.test(examinerProfile.professionalTitle.replace(/\s/g, ""))
    ) {
      try {
        const professionalTitle = await prisma.professionalTitle.findUnique({
          where: { id: examinerProfile.professionalTitle },
        });
        if (professionalTitle) {
          examinerProfileData.professionalTitle = professionalTitle.name;
          examinerProfileData.professionalTitleDescription =
            professionalTitle.description || undefined;
        }
      } catch (error) {
        logger.error("Failed to fetch professional title:", error);
      }
    }

    // Map maxTravelDistance UUID to name
    if (
      examinerProfile.maxTravelDistance &&
      uuidRegex.test(examinerProfile.maxTravelDistance.replace(/\s/g, ""))
    ) {
      try {
        const maxTravelDistance = await prisma.maximumDistanceTravel.findUnique(
          {
            where: { id: examinerProfile.maxTravelDistance },
          },
        );
        if (maxTravelDistance) {
          examinerProfileData.maxTravelDistance = maxTravelDistance.name;
        }
      } catch (error) {
        logger.error("Failed to fetch max travel distance:", error);
      }
    }

    return examinerProfileData;
  } catch (error) {
    logger.error("Error fetching examiner profile:", error);
    throw HttpError.fromError(error, "Failed to fetch examiner profile");
  }
};

export default getExaminerProfileById;
