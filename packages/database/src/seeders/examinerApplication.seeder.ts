/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';

interface ApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  provinceOfResidence: string;
  mailingAddress: string;
  specialties: string[];
  licenseNumber: string;
  provinceOfLicensure: string;
  licenseExpiryDate: Date | null;
  yearsOfIMEExperience: string;
  isForensicAssessmentTrained: boolean;
  experienceDetails: string;
  languagesSpoken: string[];
  status: 'SUBMITTED' | 'IN_REVIEW' | 'PENDING';
  imesCompleted?: string;
  currentlyConductingIMEs?: boolean;
  insurersOrClinics?: string;
  assessmentTypeOther?: string;
}

class ExaminerApplicationSeeder {
  private static instance: ExaminerApplicationSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ExaminerApplicationSeeder {
    if (!ExaminerApplicationSeeder.instance) {
      ExaminerApplicationSeeder.instance = new ExaminerApplicationSeeder(db);
    }
    return ExaminerApplicationSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting examiner application seed process...');

    const applicationsData: ApplicationData[] = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@examiner.com',
        phoneNumber: '+14165551234',
        provinceOfResidence: 'Ontario',
        mailingAddress: '123 Medical Drive, Toronto, ON M5H 2N2',
        specialties: ['orthopedic-surgery', 'sports-medicine'],
        licenseNumber: 'CPSO-12345',
        provinceOfLicensure: 'Ontario',
        licenseExpiryDate: new Date('2026-12-31'),
        yearsOfIMEExperience: 'more-than-3',
        isForensicAssessmentTrained: true,
        experienceDetails:
          'Experienced orthopedic surgeon with over 15 years of clinical practice and 5 years of IME experience. Specializing in musculoskeletal injuries and workplace assessments.',
        languagesSpoken: ['English', 'French'],
        status: 'SUBMITTED',
        imesCompleted: '50+',
        currentlyConductingIMEs: true,
        insurersOrClinics: 'Various insurers and clinics in GTA',
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@examiner.com',
        phoneNumber: '+16045552345',
        provinceOfResidence: 'British Columbia',
        mailingAddress: '456 Healthcare Ave, Vancouver, BC V6B 2P1',
        specialties: ['psychiatry', 'neurology'],
        licenseNumber: 'CPSBC-67890',
        provinceOfLicensure: 'British Columbia',
        licenseExpiryDate: new Date('2027-06-30'),
        yearsOfIMEExperience: '2-3',
        isForensicAssessmentTrained: true,
        experienceDetails:
          'Board-certified psychiatrist with expertise in mental health assessments for legal and insurance purposes. Strong background in forensic psychiatry.',
        languagesSpoken: ['English'],
        status: 'IN_REVIEW',
        imesCompleted: '20-30',
        currentlyConductingIMEs: true,
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@examiner.com',
        phoneNumber: '+14165553456',
        provinceOfResidence: 'Ontario',
        mailingAddress: '789 Wellness Street, Ottawa, ON K1A 0A9',
        specialties: ['cardiology', 'internal-medicine'],
        licenseNumber: 'CPSO-23456',
        provinceOfLicensure: 'Ontario',
        licenseExpiryDate: new Date('2026-03-31'),
        yearsOfIMEExperience: '1-2',
        isForensicAssessmentTrained: false,
        experienceDetails:
          'Cardiologist with extensive experience in cardiovascular assessments and occupational health evaluations.',
        languagesSpoken: ['English', 'Spanish'],
        status: 'SUBMITTED',
      },
      {
        firstName: 'Emily',
        lastName: 'Williams',
        email: 'emily.williams@examiner.com',
        phoneNumber: '+14035554567',
        provinceOfResidence: 'Manitoba',
        mailingAddress: '321 Health Plaza, Winnipeg, MB R3C 3G1',
        specialties: ['family-medicine', 'emergency-medicine'],
        licenseNumber: 'CPSM-34567',
        provinceOfLicensure: 'Manitoba',
        licenseExpiryDate: null,
        yearsOfIMEExperience: 'less-than-1',
        isForensicAssessmentTrained: false,
        experienceDetails:
          'Family physician transitioning into independent medical examinations. Committed to providing thorough and objective assessments.',
        languagesSpoken: ['English', 'French'],
        status: 'PENDING',
      },
    ];

    await this.createApplications(applicationsData);

    console.log('✅ Examiner application seed process completed.');
  }

  private async createApplications(applicationsData: ApplicationData[]): Promise<void> {
    console.log(`📝 Processing ${applicationsData.length} examiner applications...`);

    // Get assessment type IDs for assessmentTypeIds (required field - can be empty array per schema)
    const assessmentTypes = await this.db.assessmentType.findMany({
      where: { deletedAt: null },
      take: 2,
      select: { id: true },
    });
    const assessmentTypeIds = assessmentTypes.map(a => a.id);

    for (const appData of applicationsData) {
      const { email } = appData;

      console.log(`\n📦 Processing application: "${email}"`);

      const existing = await this.db.examinerApplication.findFirst({
        where: { email, deletedAt: null },
      });

      if (existing) {
        console.log(`ℹ️ Application already exists: "${email}" (ID: ${existing.id})`);
        continue;
      }

      try {
        const medicalLicenseDoc = await this.db.documents.create({
          data: {
            name: `medical_license_${appData.licenseNumber}.pdf`,
            displayName: `Medical License - ${appData.firstName} ${appData.lastName}`,
            type: 'application/pdf',
            size: 1024000,
          },
        });

        const resumeDoc = await this.db.documents.create({
          data: {
            name: `resume_${appData.firstName}_${appData.lastName}.pdf`,
            displayName: `Resume - ${appData.firstName} ${appData.lastName}`,
            type: 'application/pdf',
            size: 512000,
          },
        });

        const ndaDoc = await this.db.documents.create({
          data: {
            name: `nda_signed_${appData.firstName}_${appData.lastName}.pdf`,
            displayName: `Signed NDA - ${appData.firstName} ${appData.lastName}`,
            type: 'application/pdf',
            size: 256000,
          },
        });

        const insuranceDoc = await this.db.documents.create({
          data: {
            name: `insurance_${appData.firstName}_${appData.lastName}.pdf`,
            displayName: `Insurance Proof - ${appData.firstName} ${appData.lastName}`,
            type: 'application/pdf',
            size: 768000,
          },
        });

        await this.db.examinerApplication.create({
          data: {
            firstName: appData.firstName,
            lastName: appData.lastName,
            email: appData.email,
            phone: appData.phoneNumber,
            provinceOfResidence: appData.provinceOfResidence,
            mailingAddress: appData.mailingAddress,
            specialties: appData.specialties,
            licenseNumber: appData.licenseNumber,
            provinceOfLicensure: appData.provinceOfLicensure,
            licenseExpiryDate: appData.licenseExpiryDate,
            medicalLicenseDocumentIds: [medicalLicenseDoc.id],
            resumeDocumentId: resumeDoc.id,
            NdaDocumentId: ndaDoc.id,
            insuranceDocumentId: insuranceDoc.id,
            isForensicAssessmentTrained: appData.isForensicAssessmentTrained,
            yearsOfIMEExperience: appData.yearsOfIMEExperience,
            experienceDetails: appData.experienceDetails,
            languagesSpoken: appData.languagesSpoken,
            isConsentToBackgroundVerification: true,
            agreeToTerms: true,
            status: appData.status,
            assessmentTypeIds: assessmentTypeIds.length > 0 ? assessmentTypeIds : [],
            imesCompleted: appData.imesCompleted ?? null,
            currentlyConductingIMEs: appData.currentlyConductingIMEs ?? null,
            insurersOrClinics: appData.insurersOrClinics ?? null,
            assessmentTypeOther: appData.assessmentTypeOther ?? null,
          },
        });

        console.log(
          `✅ Created examiner application for: ${appData.firstName} ${appData.lastName} (Status: ${appData.status})`
        );
      } catch (error) {
        console.error(`❌ Error creating application: ${email}`, error);
        throw error;
      }
    }
  }
}

export default ExaminerApplicationSeeder;
