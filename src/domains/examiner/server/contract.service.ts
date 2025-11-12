import prisma from "@/lib/db";
import { generateContractPDF } from "@/lib/pdf-generator";
import { uploadToS3 } from "@/lib/s3";
import { sha256Buffer, hashContractData } from "@/lib/crypto";
import { signContractToken } from "@/lib/jwt";
import { ExaminerProfile, ExaminerFeeStructure, Account, User } from "@prisma/client";

type ExaminerWithRelations = ExaminerProfile & {
  account: Account & {
    user: User;
  };
  feeStructure: ExaminerFeeStructure[];
};

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
  /**
   * Create and send a contract for an examiner
   * This is the main entry point called when approving an examiner
   */
  async createAndSendContract(
    examinerProfileId: string,
    createdBy: string
  ): Promise<{ success: boolean; contractId?: string; error?: string }> {
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

      if (!examiner.feeStructure || examiner.feeStructure.length === 0) {
        return {
          success: false,
          error: "Fee structure not found. Please add fee structure before sending contract.",
        };
      }

      const feeStructure = examiner.feeStructure[0];
      const examinerName = `${examiner.account.user.firstName} ${examiner.account.user.lastName}`;
      const examinerEmail = examiner.account.user.email;

      // 2. Prepare contract data
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

      // 3. Get or create the IME template (for now, we'll create a simple one if it doesn't exist)
      let template = await prisma.documentTemplate.findFirst({
        where: { slug: "examiner-agreement" },
        include: {
          currentVersion: true,
        },
      });

      // If template doesn't exist, create it
      if (!template) {
        console.log("📝 Creating default IME agreement template...");
        template = await this.createDefaultIMETemplate(createdBy);
      }

      if (!template || !template.currentVersion) {
        return { success: false, error: "Template version not found" };
      }

      // 4. Generate PDF
      console.log("📄 Generating contract PDF...");
      const pdfBuffer = await generateContractPDF(
        examinerName,
        examiner.provinceOfResidence,
        contractData.feeStructure
      );

      // 5. Calculate hashes
      const pdfHash = sha256Buffer(pdfBuffer);
      const dataHash = hashContractData("", contractData);

      // 6. Upload to S3
      const fileName = `${examinerProfileId}/unsigned_${Date.now()}.pdf`;
      const s3Key = await uploadToS3(pdfBuffer, fileName, "application/pdf", "contracts");

      // 7. Create contract record to get ID for JWT token
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

      // 8. Generate JWT token with contract ID and examiner profile ID (expires in 90 days)
      const accessToken = signContractToken({
        contractId: tempContract.id,
        examinerProfileId,
      }, '90d');
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      // 9. Update contract with S3 details, token, and mark as SENT
      console.log("💾 Updating contract status to SENT...");
      const contract = await prisma.contract.update({
        where: { id: tempContract.id },
        data: {
          status: "SENT",
          unsignedPdfS3Key: s3Key,
          unsignedPdfSha256: pdfHash,
          sentAt: new Date(),
          accessToken,
          accessTokenExpiresAt: expiresAt,
        },
      });

      // 10. Create audit events
      await prisma.contractEvent.create({
        data: {
          contractId: contract.id,
          eventType: "created",
          actorRole: "admin",
          actorId: createdBy,
          meta: {
            s3Key,
            pdfHash,
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
          },
        },
      });

      console.log(`✅ Contract created and sent successfully: ${contract.id}`);

      return {
        success: true,
        contractId: contract.id,
      };
    } catch (error) {
      console.error("❌ Error creating contract:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create contract",
      };
    }
  }

  /**
   * Create default IME Agreement template
   * This is a fallback for when no template exists
   */
  private async createDefaultIMETemplate(createdBy: string) {
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

    // Create version 1
    const version = await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        status: "PUBLISHED",
        locale: "en-CA",
        bodyHtml: "<html><!-- PDF template placeholder --></html>",
        variablesSchema: {
          type: "object",
          properties: {
            examinerName: { type: "string" },
            province: { type: "string" },
            feeStructure: { type: "object" },
          },
        },
        defaultData: {},
        changeNotes: "Initial template version",
        checksumSha256: "placeholder",
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
