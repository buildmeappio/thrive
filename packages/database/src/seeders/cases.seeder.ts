/* eslint-disable no-console */
import { PrismaClient, UrgencyLevel, ClaimantPreference } from "@thrive/database";

interface CaseData {
  caseNumber: string;
  organizationName: string;
  claimantFirstName: string;
  claimantLastName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantProvince: string;
  claimantCity: string;
  claimantAddress: string;
  claimType: string;
  caseType: string;
  examinationType: string;
  status: string;
  urgencyLevel: UrgencyLevel;
  dueDate: Date;
  notes: string;
  preference: ClaimantPreference;
}

class CasesSeeder {
  private static instance: CasesSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): CasesSeeder {
    if (!CasesSeeder.instance) {
      CasesSeeder.instance = new CasesSeeder(db);
    }
    return CasesSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting cases seed process...");

    // Ensure required statuses exist
    await this.ensureStatusesExist();

    const casesData: CaseData[] = [
      // New Cases to be Reviewed (recent submissions)
      {
        caseNumber: "ORT-2025-1048",
        organizationName: "Desjardins Insurance",
        claimantFirstName: "John",
        claimantLastName: "Anderson",
        claimantEmail: "john.anderson@email.com",
        claimantPhone: "+14165551001",
        claimantProvince: "Ontario",
        claimantCity: "Toronto",
        claimantAddress: "100 King Street West",
        claimType: "Auto Accident",
        caseType: "Personal Injury",
        examinationType: "Orthopedic Assessment",
        status: "New Referral",
        urgencyLevel: "HIGH",
        dueDate: new Date("2025-04-18"),
        notes: "Motor vehicle accident, lower back pain, requires urgent assessment",
        preference: "IN_PERSON",
      },
      {
        caseNumber: "ORT-2025-1049",
        organizationName: "Canada Life",
        claimantFirstName: "Sarah",
        claimantLastName: "Mitchell",
        claimantEmail: "sarah.mitchell@email.com",
        claimantPhone: "+16045551002",
        claimantProvince: "British Columbia",
        claimantCity: "Vancouver",
        claimantAddress: "789 Burrard Street",
        claimType: "Long Term Disability",
        caseType: "Disability Assessment",
        examinationType: "Psychiatric Evaluation",
        status: "New Referral",
        urgencyLevel: "MEDIUM",
        dueDate: new Date("2025-04-25"),
        notes: "Anxiety and depression, workplace stress claim",
        preference: "VIRTUAL",
      },
      {
        caseNumber: "ORT-2025-1050",
        organizationName: "Manulife",
        claimantFirstName: "David",
        claimantLastName: "Thompson",
        claimantEmail: "david.thompson@email.com",
        claimantPhone: "+14035551003",
        claimantProvince: "Alberta",
        claimantCity: "Calgary",
        claimantAddress: "555 5th Avenue SW",
        claimType: "Workplace Injury",
        caseType: "Workers Compensation",
        examinationType: "Functional Capacity Evaluation",
        status: "New Referral",
        urgencyLevel: "MEDIUM",
        dueDate: new Date("2025-05-01"),
        notes: "Shoulder injury from repetitive work tasks",
        preference: "EITHER",
      },

      // Waiting to be Scheduled - Pending Status
      {
        caseNumber: "ORT-2025-0891",
        organizationName: "Sun Life Financial",
        claimantFirstName: "Emily",
        claimantLastName: "Rodriguez",
        claimantEmail: "emily.rodriguez@email.com",
        claimantPhone: "+14165551004",
        claimantProvince: "Ontario",
        claimantCity: "Mississauga",
        claimantAddress: "200 Hurontario Street",
        claimType: "Auto Accident",
        caseType: "Personal Injury",
        examinationType: "Neurological Assessment",
        status: "Pending",
        urgencyLevel: "HIGH",
        dueDate: new Date("2025-04-20"),
        notes: "Head injury from rear-end collision, awaiting examiner assignment",
        preference: "IN_PERSON",
      },
      {
        caseNumber: "ORT-2025-0892",
        organizationName: "Intact Insurance",
        claimantFirstName: "Michael",
        claimantLastName: "Brown",
        claimantEmail: "michael.brown@email.com",
        claimantPhone: "+16135551005",
        claimantProvince: "Ontario",
        claimantCity: "Ottawa",
        claimantAddress: "150 Elgin Street",
        claimType: "Slip and Fall",
        caseType: "Personal Injury",
        examinationType: "Orthopedic Assessment",
        status: "Pending",
        urgencyLevel: "MEDIUM",
        dueDate: new Date("2025-04-28"),
        notes: "Knee injury from workplace slip, pending claimant availability",
        preference: "VIRTUAL",
      },

      // Waiting to be Scheduled - Waiting to be Scheduled Status
      {
        caseNumber: "ORT-2025-0765",
        organizationName: "Aviva Canada",
        claimantFirstName: "Jennifer",
        claimantLastName: "Lee",
        claimantEmail: "jennifer.lee@email.com",
        claimantPhone: "+14165551006",
        claimantProvince: "Ontario",
        claimantCity: "Brampton",
        claimantAddress: "50 Main Street North",
        claimType: "Auto Accident",
        caseType: "Personal Injury",
        examinationType: "Psychological Assessment",
        status: "Waiting to be Scheduled",
        urgencyLevel: "LOW",
        dueDate: new Date("2025-05-10"),
        notes: "PTSD symptoms post-accident, examiner assigned, awaiting scheduling",
        preference: "EITHER",
      },
      {
        caseNumber: "ORT-2025-0766",
        organizationName: "RSA Canada",
        claimantFirstName: "Robert",
        claimantLastName: "Wilson",
        claimantEmail: "robert.wilson@email.com",
        claimantPhone: "+19055551007",
        claimantProvince: "Ontario",
        claimantCity: "Hamilton",
        claimantAddress: "300 James Street South",
        claimType: "Workplace Injury",
        caseType: "Workers Compensation",
        examinationType: "Orthopedic Assessment",
        status: "Waiting to be Scheduled",
        urgencyLevel: "MEDIUM",
        dueDate: new Date("2025-05-05"),
        notes: "Back injury from lifting, ready to schedule appointment",
        preference: "IN_PERSON",
      },

      // Waiting to be Scheduled - Scheduled Status
      {
        caseNumber: "ORT-2025-0650",
        organizationName: "TD Insurance",
        claimantFirstName: "Lisa",
        claimantLastName: "Martin",
        claimantEmail: "lisa.martin@email.com",
        claimantPhone: "+14165551008",
        claimantProvince: "Ontario",
        claimantCity: "Markham",
        claimantAddress: "7000 Warden Avenue",
        claimType: "Auto Accident",
        caseType: "Personal Injury",
        examinationType: "Orthopedic Assessment",
        status: "Scheduled",
        urgencyLevel: "MEDIUM",
        dueDate: new Date("2025-04-22"),
        notes: "Neck and shoulder pain, appointment confirmed for next week",
        preference: "IN_PERSON",
      },
      {
        caseNumber: "ORT-2025-0651",
        organizationName: "Co-operators Insurance",
        claimantFirstName: "James",
        claimantLastName: "Taylor",
        claimantEmail: "james.taylor@email.com",
        claimantPhone: "+14165551009",
        claimantProvince: "Ontario",
        claimantCity: "Richmond Hill",
        claimantAddress: "10 Centre Street",
        claimType: "Long Term Disability",
        caseType: "Disability Assessment",
        examinationType: "Internal Medicine Assessment",
        status: "Scheduled",
        urgencyLevel: "LOW",
        dueDate: new Date("2025-04-30"),
        notes: "Chronic fatigue syndrome evaluation scheduled",
        preference: "VIRTUAL",
      },
    ];

    await this.createCases(casesData);

    console.log("✅ Cases seed process completed.");
  }

  private async ensureStatusesExist() {
    console.log("📝 Ensuring case statuses exist...");

    const requiredStatuses = [
      { name: "New Referral", description: "Newly submitted case awaiting review" },
      { name: "Pending", description: "Case is pending action" },
      { name: "Waiting to be Scheduled", description: "Case is ready to be scheduled" },
      { name: "Scheduled", description: "Appointment has been scheduled" },
      { name: "In Progress", description: "Examination is in progress" },
      { name: "Completed", description: "Case has been completed" },
    ];

    for (const status of requiredStatuses) {
      const existing = await this.db.caseStatus.findFirst({
        where: { name: status.name },
      });

      if (!existing) {
        await this.db.caseStatus.create({
          data: status,
        });
        console.log(`✅ Created status: ${status.name}`);
      }
    }
  }

  private async createCases(casesData: CaseData[]): Promise<void> {
    console.log(`📝 Processing ${casesData.length} cases...`);

    // Get or create organization type
    let orgType = await this.db.organizationType.findFirst({
      where: { name: "Insurance Company" },
    });

    if (!orgType) {
      orgType = await this.db.organizationType.create({
        data: {
          name: "Insurance Company",
          description: "Insurance and financial services companies",
        },
      });
    }

    for (const caseData of casesData) {
      const { caseNumber } = caseData;

      console.log(`\n📦 Processing case: "${caseNumber}"`);

      // Check if case already exists
      const existingCase = await this.db.examination.findFirst({
        where: { caseNumber },
      });

      if (existingCase) {
        console.log(`ℹ️ Case already exists: "${caseNumber}"`);
        continue;
      }

      try {
        // Get or create organization
        let organization = await this.db.organization.findFirst({
          where: { name: caseData.organizationName },
        });

        if (!organization) {
          const orgAddress = await this.db.address.create({
            data: {
              address: "Corporate Office",
              street: "Main Street",
              city: "Toronto",
              province: "Ontario",
              postalCode: "M5H 2N2",
            },
          });

          organization = await this.db.organization.create({
            data: {
              name: caseData.organizationName,
              typeId: orgType.id,
              addressId: orgAddress.id,
              isAuthorized: true,
              dataSharingConsent: true,
              agreeToTermsAndPrivacy: true,
            },
          });
          console.log(`✅ Created organization: ${caseData.organizationName}`);
        }

        // Get or create claim type
        let claimType = await this.db.claimType.findFirst({
          where: { name: caseData.claimType },
        });

        if (!claimType) {
          claimType = await this.db.claimType.create({
            data: {
              name: caseData.claimType,
              description: `${caseData.claimType} claims`,
            },
          });
        }

        // Create claimant address
        const claimantAddress = await this.db.address.create({
          data: {
            address: caseData.claimantAddress,
            city: caseData.claimantCity,
            province: caseData.claimantProvince,
            postalCode: "M5H 2N2",
          },
        });

        // Create claimant
        const claimant = await this.db.claimant.create({
          data: {
            firstName: caseData.claimantFirstName,
            lastName: caseData.claimantLastName,
            emailAddress: caseData.claimantEmail,
            phoneNumber: caseData.claimantPhone,
            addressId: claimantAddress.id,
            claimTypeId: claimType.id,
            dateOfBirth: new Date("1985-05-15"),
            gender: "Other",
          },
        });
        console.log(`✅ Created claimant: ${caseData.claimantFirstName} ${caseData.claimantLastName}`);

        // Get or create case type
        let caseType = await this.db.caseType.findFirst({
          where: { name: caseData.caseType },
        });

        if (!caseType) {
          caseType = await this.db.caseType.create({
            data: {
              name: caseData.caseType,
              description: `${caseData.caseType} cases`,
            },
          });
        }

        // Create case
        const caseRecord = await this.db.case.create({
          data: {
            organizationId: organization.id,
            caseTypeId: caseType.id,
            consentForSubmission: true,
            isDraft: false,
            reason: caseData.notes,
          },
        });
        console.log(`✅ Created case record`);

        // Get or create examination type
        let examinationType = await this.db.examinationType.findFirst({
          where: { name: caseData.examinationType },
        });

        if (!examinationType) {
          examinationType = await this.db.examinationType.create({
            data: {
              name: caseData.examinationType,
              shortForm: caseData.examinationType.split(" ")[0],
              description: `${caseData.examinationType} examination`,
            },
          });
        }

        // Get case status
        const caseStatus = await this.db.caseStatus.findFirst({
          where: { name: caseData.status },
        });

        if (!caseStatus) {
          throw new Error(`Status not found: ${caseData.status}`);
        }

        // Create examination
        await this.db.examination.create({
          data: {
            caseNumber: caseData.caseNumber,
            caseId: caseRecord.id,
            claimantId: claimant.id,
            examinationTypeId: examinationType.id,
            statusId: caseStatus.id,
            urgencyLevel: caseData.urgencyLevel,
            dueDate: caseData.dueDate,
            notes: caseData.notes,
            preference: caseData.preference,
            supportPerson: false,
          },
        });

        console.log(`✅ Created examination: ${caseData.caseNumber} (Status: ${caseData.status})`);
      } catch (error) {
        console.error(`❌ Error creating case: ${caseNumber}`, error);
        throw error;
      }
    }
  }
}

export default CasesSeeder;

