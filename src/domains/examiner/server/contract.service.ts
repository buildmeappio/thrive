import prisma from "@/lib/db";
import { createContractDocument, type ContractData as GoogleDocsContractData } from "@/lib/google-docs";
import { uploadToS3 } from "@/lib/s3";
import { sha256Buffer, hashContractData } from "@/lib/crypto";
import { signContractToken } from "@/lib/jwt";
import { ENV } from "@/constants/variables";
import logger from "@/utils/logger";

type ContractData = {
  examinerName: string;
  examinerEmail: string;
  province: string;
  feeStructure: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate?: number;
    cancellationFee: number;
    paymentTerms: string;
  };
  effectiveDate: string;
};

class ContractService {
  private async getOrCreateTemplate(createdBy: string) {
    // 2. Get or create the IME template
    let template = await prisma.documentTemplate.findFirst({
      where: { slug: "examiner-agreement" },
      include: {
        currentVersion: true,
      },
    });

    // If template doesn't exist, create it (requires ENV vars for initial setup)
    if (!template) {
      logger.log("📝 Creating default IME agreement template...");
      if (!ENV.GOOGLE_CONTRACT_TEMPLATE_ID || !ENV.GOOGLE_CONTRACTS_FOLDER_ID) {
        return {
          success: false,
          error: "Google Docs configuration missing. Please set GOOGLE_CONTRACT_TEMPLATE_ID and GOOGLE_CONTRACTS_FOLDER_ID to create the initial template.",
        };
      }
      template = await this.createDefaultIMETemplate(createdBy, ENV.GOOGLE_CONTRACT_TEMPLATE_ID, ENV.GOOGLE_CONTRACTS_FOLDER_ID);
    }

    if (!template || !template.currentVersion) {
      return { success: false, error: "Template version not found" };
    }

    // Ensure the template version has a Google Doc Template ID, update if missing
    if (!template.currentVersion.googleDocTemplateId) {
      if (!ENV.GOOGLE_CONTRACT_TEMPLATE_ID) {
        return {
          success: false,
          error: "Template version does not have a Google Doc template ID configured, and no ID provided in environment. Please configure the template version.",
        };
      }
      await prisma.templateVersion.update({
        where: { id: template.currentVersion.id },
        data: { googleDocTemplateId: ENV.GOOGLE_CONTRACT_TEMPLATE_ID },
      });

      // Refetch template with updated currentVersion
      template = await prisma.documentTemplate.findUnique({
        where: { id: template.id },
        include: {
          currentVersion: true,
        },
      });

      // Fallback if still not set for any reason
      if (!template || !template.currentVersion || !template.currentVersion.googleDocTemplateId) {
        return {
          success: false,
          error: "Failed to update template version with Google Doc Template ID.",
        };
      }
    }

    // Ensure the template version has a Google Docs Folder ID, update in DB if missing
    let folderId = template.currentVersion.googleDocFolderId || ENV.GOOGLE_CONTRACTS_FOLDER_ID;
    if (!template.currentVersion.googleDocFolderId && ENV.GOOGLE_CONTRACTS_FOLDER_ID) {
      await prisma.templateVersion.update({
        where: { id: template.currentVersion.id },
        data: { googleDocFolderId: ENV.GOOGLE_CONTRACTS_FOLDER_ID },
      });

      // Refetch template to ensure up to date
      template = await prisma.documentTemplate.findUnique({
        where: { id: template.id },
        include: {
          currentVersion: true,
        },
      });

      folderId = template?.currentVersion?.googleDocFolderId || ENV.GOOGLE_CONTRACTS_FOLDER_ID;
    }

    if (!folderId) {
      return {
        success: false,
        error: "Google Docs folder ID not configured. Please set GOOGLE_CONTRACTS_FOLDER_ID or configure template version.",
      };
    }

    return { success: true, template };
  }

  /**
   * Create and send a contract for an application
   * This is called when sending a contract to an application (before examiner profile exists)
   */
  async createAndSendContractForApplication(
    applicationId: string,
    createdBy: string
  ): Promise<{
    success: boolean;
    contractId?: string;
    documentId?: string;
    s3?: { bucket: string; key: string };
    driveHtmlId?: string;
    error?: string;
  }> {
    try {
      // 1. Get application details
      const application = await prisma.examinerApplication.findUnique({
        where: { id: applicationId },
        include: {
          address: true,
        },
      });

      if (!application) {
        return { success: false, error: "Application not found" };
      }

      // Fee structure is required for contract creation
      if (!application.IMEFee || !application.recordReviewFee || !application.cancellationFee || !application.paymentTerms) {
        return {
          success: false,
          error: "Fee structure not found. Please add fee structure before sending contract.",
        };
      }

      const examinerName = `${application.firstName || ""} ${application.lastName || ""}`.trim();
      const examinerEmail = application.email;

      // 2. Get or create the IME template
      const templateResult = await this.getOrCreateTemplate(createdBy);
      if (!templateResult.success || !templateResult.template) {
        return { success: false, error: templateResult.error || "Template not found" };
      }

      const template = templateResult.template;

      // 3. Prepare contract data for Google Docs
      const googleDocsContractData: GoogleDocsContractData = {
        examinerName,
        province: application.provinceOfResidence,
        effectiveDate: new Date(),
        feeStructure: {
          IMEFee: Number(application.IMEFee),
          recordReviewFee: Number(application.recordReviewFee),
          hourlyRate: application.hourlyRate ? Number(application.hourlyRate) : undefined,
          cancellationFee: Number(application.cancellationFee),
          paymentTerms: application.paymentTerms,
        },
      };

      // 4. Create Google Doc, merge placeholders, and export HTML
      logger.log("📄 Creating contract from Google Doc template...");
      const { documentId, htmlContent, driveHtmlId } = await createContractDocument(
        template.currentVersion.googleDocTemplateId,
        template.currentVersion.googleDocFolderId,
        googleDocsContractData,
        false // Don't save HTML to Drive for now
      );

      // 5. Prepare contract data for database (contract content data only, no metadata)
      const contractData: ContractData = {
        examinerName,
        examinerEmail,
        province: application.provinceOfResidence,
        feeStructure: {
          IMEFee: Number(application.IMEFee),
          recordReviewFee: Number(application.recordReviewFee),
          hourlyRate: application.hourlyRate ? Number(application.hourlyRate) : undefined,
          cancellationFee: Number(application.cancellationFee),
          paymentTerms: application.paymentTerms,
        },
        effectiveDate: new Date().toISOString().split("T")[0],
      };

      // 6. Calculate hashes - convert HTML string to Buffer for hashing
      const htmlBuffer = Buffer.from(htmlContent, 'utf-8');
      const htmlHash = sha256Buffer(htmlBuffer);
      const dataHash = hashContractData("", contractData);

      // 7. Upload unsigned HTML to S3
      const fileName = `application/${applicationId}/unsigned_${Date.now()}.html`;
      const s3Key = await uploadToS3(htmlBuffer, fileName, "text/html", "contracts");

      // 8. Create contract record to get ID for JWT token
      const tempContract = await prisma.contract.create({
        data: {
          applicationId: applicationId,
          examinerProfileId: null, // Will be set when profile is created
          templateId: template.id,
          templateVersionId: template.currentVersion.id,
          status: "DRAFT",
          data: contractData as any,
          dataHash,
          createdBy,
        },
      });

      // 9. Generate JWT token with contract ID and application ID (expires in 90 days)
      const accessToken = signContractToken({
        contractId: tempContract.id,
        applicationId: applicationId,
      }, '90d');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      // 10. Update contract with S3 details, Google Doc fields, token, and mark as SENT
      logger.log("💾 Updating contract status to SENT...");
      const googleDocUrl = `https://docs.google.com/document/d/${documentId}`;
      logger.log("googleDocUrl", googleDocUrl);
      logger.log("documentId", documentId);
      logger.log("driveHtmlId", driveHtmlId);
      logger.log("s3Key", s3Key);
      logger.log("htmlHash", htmlHash);
      logger.log("accessToken", accessToken);

      const contract = await prisma.contract.update({
        where: { id: tempContract.id },
        data: {
          unsignedHtmlS3Key: s3Key,
          unsignedHtmlSha256: htmlHash,
          googleDocId: documentId,
          googleDocUrl: googleDocUrl,
          driveHtmlId: driveHtmlId || null,
          status: "SENT",
          sentAt: new Date(),
          accessToken: accessToken,
          accessTokenExpiresAt: expiresAt,
        },
      });

      // 11. Create audit events
      await prisma.contractEvent.create({
        data: {
          contractId: contract.id,
          eventType: "created",
          actorRole: "admin",
          actorId: createdBy,
          meta: {
            s3Key,
            htmlHash,
            googleDocId: documentId,
            driveHtmlId: driveHtmlId,
            applicationId: applicationId,
          },
        },
      });

      await prisma.contractEvent.create({
        data: {
          contractId: contract.id,
          eventType: "sent",
          actorRole: "admin",
          actorId: createdBy,
          meta: {
            sentTo: examinerEmail,
            s3Key,
            googleDocId: documentId,
            applicationId: applicationId,
          },
        },
      });

      logger.log(`✅ Contract created and sent successfully for application: ${contract.id}`);
      logger.log(`   Google Doc ID: ${documentId}`);
      logger.log(`   S3 Key: ${s3Key}`);

      return {
        success: true,
        contractId: contract.id,
        documentId: documentId,
        s3: {
          bucket: ENV.AWS_S3_BUCKET || "",
          key: s3Key,
        },
        driveHtmlId: driveHtmlId || undefined,
      };
    } catch (error) {
      logger.error("Error creating contract for application:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create contract",
      };
    }
  }

  /**
   * Create and send a contract for an examiner
   * This is the main entry point called when approving an examiner
   */
  async createAndSendContract(
    examinerProfileId: string,
    createdBy: string
  ): Promise<{
    success: boolean;
    contractId?: string;
    documentId?: string;
    s3?: { bucket: string; key: string };
    driveHtmlId?: string;
    error?: string;
  }> {
    try {
      // 1. Get examiner details with relations
      const examiner = await prisma.examinerProfile.findUnique({
        where: { id: examinerProfileId },
        include: {
          account: {
            include: {
              user: true,
            },
          },
          address: true,
          feeStructure: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      if (!examiner) {
        return { success: false, error: "Examiner not found" };
      }

      // Fee structure is required for contract creation
      if (!examiner.feeStructure || examiner.feeStructure.length === 0) {
        return {
          success: false,
          error: "Fee structure not found. Please add fee structure before sending contract.",
        };
      }

      const feeStructure = examiner.feeStructure[0];
      const examinerName = `${examiner.account.user.firstName} ${examiner.account.user.lastName}`;
      const examinerEmail = examiner.account.user.email;

      // 2. Get or create the IME template
      const templateResult = await this.getOrCreateTemplate(createdBy);
      if (!templateResult.success || !templateResult.template) {
        return { success: false, error: templateResult.error || "Template not found" };
      }

      const template = templateResult.template;



      // 3. Prepare contract data for Google Docs
      const googleDocsContractData: GoogleDocsContractData = {
        examinerName,
        province: examiner.provinceOfResidence,
        effectiveDate: new Date(),
        feeStructure: {
          IMEFee: Number(feeStructure.IMEFee),
          recordReviewFee: Number(feeStructure.recordReviewFee),
          hourlyRate: feeStructure.hourlyRate ? Number(feeStructure.hourlyRate) : undefined,
          cancellationFee: Number(feeStructure.cancellationFee),
          paymentTerms: feeStructure.paymentTerms,
        },
      };

      // 4. Create Google Doc, merge placeholders, and export HTML
      logger.log("📄 Creating contract from Google Doc template...");
      const { documentId, htmlContent, driveHtmlId } = await createContractDocument(
        template.currentVersion.googleDocTemplateId,
        template.currentVersion.googleDocFolderId,
        googleDocsContractData,
        false // Don't save HTML to Drive for now
      );

      // 5. Prepare contract data for database (contract content data only, no metadata)
      const contractData: ContractData = {
        examinerName,
        examinerEmail,
        province: examiner.provinceOfResidence,
        feeStructure: {
          IMEFee: Number(feeStructure.IMEFee),
          recordReviewFee: Number(feeStructure.recordReviewFee),
          hourlyRate: feeStructure.hourlyRate ? Number(feeStructure.hourlyRate) : undefined,
          cancellationFee: Number(feeStructure.cancellationFee),
          paymentTerms: feeStructure.paymentTerms,
        },
        effectiveDate: new Date().toISOString().split("T")[0],
      };

      // 6. Calculate hashes - convert HTML string to Buffer for hashing
      const htmlBuffer = Buffer.from(htmlContent, 'utf-8');
      const htmlHash = sha256Buffer(htmlBuffer);
      const dataHash = hashContractData("", contractData);

      // 7. Upload unsigned HTML to S3
      const fileName = `${examinerProfileId}/unsigned_${Date.now()}.html`;
      const s3Key = await uploadToS3(htmlBuffer, fileName, "text/html", "contracts");

      // 8. Create contract record to get ID for JWT token
      const tempContract = await prisma.contract.create({
        data: {
          examinerProfileId,
          templateId: template.id,
          templateVersionId: template.currentVersion.id,
          status: "DRAFT",
          data: contractData as any,
          dataHash,
          createdBy,
        },
      });

      // 9. Generate JWT token with contract ID and examiner profile ID (expires in 90 days)
      const accessToken = signContractToken({
        contractId: tempContract.id,
        examinerProfileId,
      }, '90d');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      // 10. Update contract with S3 details, Google Doc fields, token, and mark as SENT
      logger.log("💾 Updating contract status to SENT...");
      const googleDocUrl = `https://docs.google.com/document/d/${documentId}`;
      logger.log("googleDocUrl", googleDocUrl);
      logger.log("documentId", documentId);
      logger.log("driveHtmlId", driveHtmlId);
      logger.log("s3Key", s3Key);
      logger.log("htmlHash", htmlHash);
      logger.log("accessToken", accessToken);
      logger.log("expiresAt", expiresAt);
      logger.log("tempContract", tempContract);
      const contract = await prisma.contract.update({
        where: { id: tempContract.id },
        data: {
          status: "SENT",
          unsignedHtmlS3Key: s3Key, // Storage for HTML contract
          unsignedHtmlSha256: htmlHash, // SHA for HTML contract
          googleDocId: documentId,
          googleDocUrl: googleDocUrl,
          driveHtmlId: driveHtmlId || null, // Storage for Drive HTML export (optional)
          sentAt: new Date(),
          accessToken,
          accessTokenExpiresAt: expiresAt,
        },
      });

      // 11. Create audit events
      await prisma.contractEvent.create({
        data: {
          contractId: contract.id,
          eventType: "created",
          actorRole: "admin",
          actorId: createdBy,
          meta: {
            s3Key,
            htmlHash,
            googleDocId: documentId,
            driveHtmlId: driveHtmlId,
          },
        },
      });

      await prisma.contractEvent.create({
        data: {
          contractId: contract.id,
          eventType: "sent",
          actorRole: "admin",
          actorId: createdBy,
          meta: {
            sentTo: examinerEmail,
            s3Key,
            googleDocId: documentId,
          },
        },
      });

      logger.log(`✅ Contract created and sent successfully: ${contract.id}`);
      logger.log(`   Google Doc ID: ${documentId}`);
      logger.log(`   S3 Key: ${s3Key}`);

      return {
        success: true,
        contractId: contract.id,
        documentId,
        s3: {
          bucket: ENV.AWS_S3_BUCKET || "",
          key: s3Key,
        },
        driveHtmlId: driveHtmlId,
      };
    } catch (error) {
      logger.error("❌ Error creating contract:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create contract",
      };
    }
  }

  /**
   * Create default IME Agreement template
   * This is a fallback for when no template exists
   * Requires Google Doc template ID and folder ID to be provided
   */
  private async createDefaultIMETemplate(
    createdBy: string,
    googleDocTemplateId: string,
    googleDocFolderId: string
  ) {
    // Create template
    const template = await prisma.documentTemplate.create({
      data: {
        slug: "examiner-agreement",
        displayName: "Independent Medical Examiner Agreement",
        category: "contracts",
        isActive: true,
        createdBy,
      },
    });

    // Create version 1 with Google Doc template ID
    const version = await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        status: "PUBLISHED",
        locale: "en-CA",
        bodyHtml: "<html><!-- Google Docs template used instead --></html>",
        variablesSchema: {
          type: "object",
          properties: {
            examinerName: { type: "string" },
            province: { type: "string" },
            feeStructure: { type: "object" },
          },
        },
        defaultData: {},
        changeNotes: "Initial template version with Google Docs integration",
        checksumSha256: "placeholder",
        googleDocTemplateId: googleDocTemplateId,
        googleDocFolderId: googleDocFolderId,
        createdBy,
      },
    });

    // Update template to point to current version
    await prisma.documentTemplate.update({
      where: { id: template.id },
      data: { currentVersionId: version.id },
    });

    // Fetch and return with relations
    return await prisma.documentTemplate.findUnique({
      where: { id: template.id },
      include: { currentVersion: true },
    });
  }

  /**
   * Get contract by ID
   */
  async getContractById(contractId: string) {
    return await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        examinerProfile: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
          },
        },
        template: true,
        templateVersion: true,
        events: {
          orderBy: {
            at: "desc",
          },
        },
      },
    });
  }

  /**
   * Get contracts for an examiner
   */
  async getContractsByExaminerProfileId(examinerProfileId: string) {
    return await prisma.contract.findMany({
      where: { examinerProfileId },
      include: {
        template: true,
        templateVersion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Record contract view event
   */
  async recordContractView(contractId: string, actorId?: string) {
    // Update contract viewed timestamp if first view
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (contract && !contract.viewedAt) {
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          viewedAt: new Date(),
          status: "VIEWED",
        },
      });
    }

    // Create event
    await prisma.contractEvent.create({
      data: {
        contractId,
        eventType: "viewed",
        actorRole: "examiner",
        actorId,
        meta: {},
      },
    });
  }
}

const contractService = new ContractService();
export default contractService;