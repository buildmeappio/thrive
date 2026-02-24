/* eslint-disable no-console */
import { PrismaClient } from "@thrive/database";
import * as bcrypt from "bcryptjs";
import { Roles } from "../constants/role";

interface ExaminerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  provinceOfResidence: string;
  mailingAddress: string;
  specialties: string[];
  licenseNumber: string;
  provinceOfLicensure: string;
  licenseExpiryDate: Date | null;
  yearsOfIMEExperience: string;
  isForensicAssessmentTrained: boolean;
  bio: string;
  languages: string[];
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  preferredRegions?: string;
  maxTravelDistance?: string;
  acceptVirtualAssessments?: boolean;
}

class ExaminerProfileSeeder {
  private static instance: ExaminerProfileSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ExaminerProfileSeeder {
    if (!ExaminerProfileSeeder.instance) {
      ExaminerProfileSeeder.instance = new ExaminerProfileSeeder(db);
    }
    return ExaminerProfileSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting examiner profile seed process...");

    const examinersData: ExaminerData[] = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@examiner.com",
        password: "examiner123",
        phoneNumber: "+14165551234",
        provinceOfResidence: "Ontario",
        mailingAddress: "123 Medical Drive, Toronto, ON M5H 2N2",
        specialties: ["orthopedic-surgery", "sports-medicine"],
        licenseNumber: "CPSO-12345",
        provinceOfLicensure: "Ontario",
        licenseExpiryDate: new Date("2026-12-31"),
        yearsOfIMEExperience: "more-than-3",
        isForensicAssessmentTrained: true,
        bio: "Experienced orthopedic surgeon with over 15 years of clinical practice and 5 years of IME experience. Specializing in musculoskeletal injuries and workplace assessments.",
        languages: ["English", "French"],
        status: "ACCEPTED",
        preferredRegions: "Greater Toronto Area, Hamilton, Niagara Region",
        maxTravelDistance: "100 km",
        acceptVirtualAssessments: true,
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@examiner.com",
        password: "examiner123",
        phoneNumber: "+16045552345",
        provinceOfResidence: "British Columbia  ",
        mailingAddress: "456 Healthcare Ave, Vancouver, BC V6B 2P1",
        specialties: ["psychiatry", "neurology"],
        licenseNumber: "CPSBC-67890",
        provinceOfLicensure: "British Columbia  ",
        licenseExpiryDate: new Date("2027-06-30"),
        yearsOfIMEExperience: "2-3",
        isForensicAssessmentTrained: true,
        bio: "Board-certified psychiatrist with expertise in mental health assessments for legal and insurance purposes. Strong background in forensic psychiatry.",
        languages: ["English"],
        status: "ACCEPTED",
        preferredRegions: "Vancouver, Surrey, Burnaby, Richmond",
        maxTravelDistance: "50 km",
        acceptVirtualAssessments: true,
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@examiner.com",
        password: "examiner123",
        phoneNumber: "+14165553456",
        provinceOfResidence: "Ontario",
        mailingAddress: "789 Wellness Street, Ottawa, ON K1A 0A9",
        specialties: ["cardiology", "internal-medicine"],
        licenseNumber: "CPSO-23456",
        provinceOfLicensure: "Ontario",
        licenseExpiryDate: new Date("2026-03-31"),
        yearsOfIMEExperience: "1-2",
        isForensicAssessmentTrained: false,
        bio: "Cardiologist with extensive experience in cardiovascular assessments and occupational health evaluations.",
        languages: ["English", "Spanish"],
        status: "PENDING",
        preferredRegions: "Ottawa, Gatineau, Eastern Ontario",
        maxTravelDistance: "75 km",
        acceptVirtualAssessments: false,
      },
      {
        firstName: "Emily",
        lastName: "Williams",
        email: "emily.williams@examiner.com",
        password: "examiner123",
        phoneNumber: "+14035554567",
        provinceOfResidence: "Manitoba",
        mailingAddress: "321 Health Plaza, Winnipeg, MB R3C 3G1",
        specialties: ["family-medicine", "emergency-medicine"],
        licenseNumber: "CPSM-34567",
        provinceOfLicensure: "Manitoba",
        licenseExpiryDate: null,
        yearsOfIMEExperience: "less-than-1",
        isForensicAssessmentTrained: false,
        bio: "Family physician transitioning into independent medical examinations. Committed to providing thorough and objective assessments.",
        languages: ["English", "French"],
        status: "PENDING",
        preferredRegions: "Winnipeg, Brandon, Steinbach",
        maxTravelDistance: "150 km",
        acceptVirtualAssessments: true,
      },
    ];

    await this.createExaminers(examinersData);

    console.log("✅ Examiner profile seed process completed.");
  }

  private async createExaminers(examinersData: ExaminerData[]): Promise<void> {
    console.log(`📝 Processing ${examinersData.length} examiner profiles...`);

    // Ensure medical examiner role exists
    const medicalExaminerRole = await this.db.role.findFirst({
      where: { name: Roles.MEDICAL_EXAMINER },
    });

    if (!medicalExaminerRole) {
      throw new Error(
        "Medical examiner role not found. Please run role seeder first."
      );
    }

    for (const examinerData of examinersData) {
      const { email } = examinerData;

      console.log(`\n📦 Processing examiner: "${email}"`);

      // Check if user already exists
      const existingUser = await this.db.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        console.log(
          `ℹ️ User already exists: "${email}" (ID: ${existingUser.id})`
        );
        continue;
      }

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(examinerData.password, 10);

        // Create user
        const user = await this.db.user.create({
          data: {
            firstName: examinerData.firstName,
            lastName: examinerData.lastName,
            email: examinerData.email,
            password: hashedPassword,
            phone: examinerData.phoneNumber,
          },
        });

        console.log(`✅ Created user: "${email}" (ID: ${user.id})`);

        // Create account
        const account = await this.db.account.create({
          data: {
            roleId: medicalExaminerRole.id,
            userId: user.id,
            isVerified: examinerData.status === "ACCEPTED",
          },
        });

        console.log(`✅ Created account (ID: ${account.id})`);

        // Create dummy documents
        const medicalLicenseDoc = await this.db.documents.create({
          data: {
            name: `medical_license_${examinerData.licenseNumber}.pdf`,
            displayName: `Medical License - ${examinerData.firstName} ${examinerData.lastName}`,
            type: "application/pdf",
            size: 1024000, // 1MB placeholder
          },
        });

        const resumeDoc = await this.db.documents.create({
          data: {
            name: `resume_${examinerData.firstName}_${examinerData.lastName}.pdf`,
            displayName: `Resume - ${examinerData.firstName} ${examinerData.lastName}`,
            type: "application/pdf",
            size: 512000, // 512KB placeholder
          },
        });

        const ndaDoc = await this.db.documents.create({
          data: {
            name: `nda_signed_${examinerData.firstName}_${examinerData.lastName}.pdf`,
            displayName: `Signed NDA - ${examinerData.firstName} ${examinerData.lastName}`,
            type: "application/pdf",
            size: 256000, // 256KB placeholder
          },
        });

        const insuranceDoc = await this.db.documents.create({
          data: {
            name: `insurance_${examinerData.firstName}_${examinerData.lastName}.pdf`,
            displayName: `Insurance Proof - ${examinerData.firstName} ${examinerData.lastName}`,
            type: "application/pdf",
            size: 768000, // 768KB placeholder
          },
        });

        console.log(`✅ Created dummy documents`);

        // Create examiner profile
        const examinerProfile = await this.db.examinerProfile.create({
          data: {
            accountId: account.id,
            provinceOfResidence: examinerData.provinceOfResidence,
            mailingAddress: examinerData.mailingAddress,
            specialties: examinerData.specialties,
            licenseNumber: examinerData.licenseNumber,
            provinceOfLicensure: examinerData.provinceOfLicensure,
            licenseExpiryDate: examinerData.licenseExpiryDate,
            medicalLicenseDocumentIds: [medicalLicenseDoc.id],
            resumeDocumentId: resumeDoc.id,
            NdaDocumentId: ndaDoc.id,
            insuranceDocumentId: insuranceDoc.id,
            yearsOfIMEExperience: examinerData.yearsOfIMEExperience,
            isForensicAssessmentTrained:
              examinerData.isForensicAssessmentTrained,
            bio: examinerData.bio,
            isConsentToBackgroundVerification: true,
            agreeToTerms: true,
            status: examinerData.status,
            preferredRegions: examinerData.preferredRegions,
            maxTravelDistance: examinerData.maxTravelDistance,
            acceptVirtualAssessments: examinerData.acceptVirtualAssessments,
            ...(examinerData.status === "ACCEPTED" && {
              approvedAt: new Date(),
            }),
          },
        });

        console.log(`✅ Created examiner profile (ID: ${examinerProfile.id})`);

        // Link languages
        for (const languageName of examinerData.languages) {
          const language = await this.db.language.findFirst({
            where: { name: languageName },
          });

          if (language) {
            await this.db.examinerLanguage.create({
              data: {
                examinerProfileId: examinerProfile.id,
                languageId: language.id,
              },
            });
            console.log(`✅ Linked language: ${languageName}`);
          } else {
            console.log(`⚠️ Language not found: ${languageName}`);
          }
        }

        console.log(
          `✅ Successfully created examiner profile for: ${examinerData.firstName} ${examinerData.lastName} (Status: ${examinerData.status})`
        );
      } catch (error) {
        console.error(`❌ Error creating examiner: ${email}`, error);
        throw error;
      }
    }
  }
}

export default ExaminerProfileSeeder;
