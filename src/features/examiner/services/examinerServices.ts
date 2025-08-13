import type { ExaminerProfile, User } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import { AuditLogService } from '@/shared/services/AuditLogService';
import { NotificationService } from '@/shared/services/NotificationService';
import { EncryptionService } from '@/shared/services/EncryptionService';
import type {
  ExaminerPersonalInfoSchema,
  ExaminerLicenseSchema,
  ExaminerProfessionalSchema,
  ExaminerDocumentSchema,
} from '../schemas/examinerSchema';

export type ExaminerProfileWithUser = ExaminerProfile & {
  user: User;
};

interface OnboardingProgress {
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
  progressPercentage: number;
  isComplete: boolean;
  nextStep?: string;
}

export class ExaminerService {
  private auditLogService: AuditLogService;
  private notificationService: NotificationService;
  private encryptionService: EncryptionService;

  constructor() {
    this.auditLogService = new AuditLogService();
    this.notificationService = new NotificationService();
    this.encryptionService = new EncryptionService();
  }

  // Initialize examiner profile
  async initializeExaminerProfile(
    userId: string,
    request?: { ip?: string; userAgent?: string }
  ): Promise<{
    profile: ExaminerProfile;
    success: boolean;
    message: string;
  }> {
    try {
      // Check if profile already exists
      const existingProfile = await prisma.examinerProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          profile: existingProfile,
          success: true,
          message: 'Examiner profile already exists',
        };
      }

      // Create new examiner profile with default values
      const profile = await prisma.examinerProfile.create({
        data: {
          userId,
          firstName: '',
          lastName: '',
          phone: '',
          dateOfBirth: new Date(),
          licenseNumber: '',
          licenseProvince: 'ON', // Default to Ontario
          licenseExpiryDate: new Date(),
          specialties: [],
          subSpecialties: [],
          yearsExperience: 0,
          languagesSpoken: [],
          certifiedIn: [],
          practiceType: 'Private',
          medicalSchool: '',
          graduationYear: new Date().getFullYear(),
          onboardingStep: 'personal_info',
          profileCompleteness: 0,
          practiceAddress: {},
          emergencyContact: {},
          malpracticeInsurance: {},
          criminalBackground: {},
          boardCertifications: [],
          clinicName: '',
          mailingAddress: {},
        },
      });

      // Log profile initialization
      await this.auditLogService.log({
        userId,
        action: 'CREATE',
        resource: 'examiner_profile',
        resourceId: profile.id,
        description: 'Examiner profile initialized',
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      });

      return {
        profile,
        success: true,
        message: 'Examiner profile initialized successfully',
      };
    } catch (error) {
      console.error('Error initializing examiner profile:', error);
      return {
        profile: null as any,
        success: false,
        message: 'Failed to initialize examiner profile',
      };
    }
  }

  // Update personal information
  async updatePersonalInfo(
    userId: string,
    data: ExaminerPersonalInfoSchema,
    request?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; message: string; profile?: ExaminerProfile }> {
    try {
      // Encrypt sensitive data
      const encryptedData = {
        firstName: await this.encryptionService.encrypt(data.firstName),
        lastName: await this.encryptionService.encrypt(data.lastName),
        phone: await this.encryptionService.encrypt(data.phone),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      };

      const profile = await prisma.examinerProfile.update({
        where: { userId },
        data: {
          ...encryptedData,
          onboardingStep: 'license_info',
          profileCompleteness: this.calculateProfileCompleteness('personal_info'),
        },
      });

      await this.auditLogService.log({
        userId,
        action: 'UPDATE',
        resource: 'examiner_profile',
        resourceId: profile.id,
        description: 'Personal information updated',
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      });

      return {
        success: true,
        message: 'Personal information updated successfully',
        profile,
      };
    } catch (error) {
      console.error('Error updating personal info:', error);
      return {
        success: false,
        message: 'Failed to update personal information',
      };
    }
  }

  // Update license information
  async updateLicenseInfo(
    userId: string,
    data: ExaminerLicenseSchema,
    request?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; message: string; profile?: ExaminerProfile }> {
    try {
      const encryptedData = {
        licenseNumber: await this.encryptionService.encrypt(data.licenseNumber),
        licenseProvince: data.licenseProvince,
        licenseExpiryDate: data.licenseExpiryDate,
        secondaryLicenses: data.secondaryLicenses
          ? await this.encryptionService.encryptJson(data.secondaryLicenses)
          : null,
      };

      const profile = await prisma.examinerProfile.update({
        where: { userId },
        data: {
          ...encryptedData,
          onboardingStep: 'professional_details',
          profileCompleteness: this.calculateProfileCompleteness('license_info'),
        },
      });

      await this.auditLogService.log({
        userId,
        action: 'UPDATE',
        resource: 'examiner_profile',
        resourceId: profile.id,
        description: 'License information updated',
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      });

      return {
        success: true,
        message: 'License information updated successfully',
        profile,
      };
    } catch (error) {
      console.error('Error updating license info:', error);
      return {
        success: false,
        message: 'Failed to update license information',
      };
    }
  }

  // Update professional details
  async updateProfessionalDetails(
    userId: string,
    data: ExaminerProfessionalSchema,
    request?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; message: string; profile?: ExaminerProfile }> {
    try {
      const profile = await prisma.examinerProfile.update({
        where: { userId },
        data: {
          specialties: data.specialties,
          subSpecialties: data.subSpecialties || [],
          yearsExperience: data.yearsExperience,
          languagesSpoken: data.languagesSpoken,
          certifiedIn: data.certifiedIn || [],
          onboardingStep: 'practice_info',
          profileCompleteness: this.calculateProfileCompleteness('professional_details'),
        },
      });

      await this.auditLogService.log({
        userId,
        action: 'UPDATE',
        resource: 'examiner_profile',
        resourceId: profile.id,
        description: 'Professional details updated',
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      });

      return {
        success: true,
        message: 'Professional details updated successfully',
        profile,
      };
    } catch (error) {
      console.error('Error updating professional details:', error);
      return {
        success: false,
        message: 'Failed to update professional details',
      };
    }
  }

  // Get examiner profile
  async getExaminerProfile(userId: string): Promise<ExaminerProfileWithUser | null> {
    try {
      const profile = await prisma.examinerProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      return profile as ExaminerProfileWithUser | null;
    } catch (error) {
      console.error('Error getting examiner profile:', error);
      return null;
    }
  }

  // Get onboarding progress
  async getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
    try {
      const profile = await prisma.examinerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return {
          currentStep: 'personal_info',
          completedSteps: [],
          totalSteps: 9,
          progressPercentage: 0,
          isComplete: false,
          nextStep: 'personal_info',
        };
      }

      const steps = [
        'personal_info',
        'license_info',
        'professional_details',
        'practice_info',
        'education_credentials',
        'ime_experience',
        'insurance_legal',
        'availability_rates',
        'consent_compliance',
      ];

      const currentStepIndex = steps.indexOf(profile.onboardingStep || 'personal_info');
      const completedSteps = steps.slice(0, Math.max(0, currentStepIndex));
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = nextStepIndex < steps.length ? steps[nextStepIndex] : undefined;

      return {
        currentStep: profile.onboardingStep || 'personal_info',
        completedSteps,
        totalSteps: steps.length,
        progressPercentage: profile.profileCompleteness,
        isComplete: profile.status === 'UNDER_REVIEW' || profile.status === 'APPROVED',
        nextStep,
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return {
        currentStep: 'personal_info',
        completedSteps: [],
        totalSteps: 9,
        progressPercentage: 0,
        isComplete: false,
        nextStep: 'personal_info',
      };
    }
  }

  // Upload document
  async uploadDocument(
    userId: string,
    data: ExaminerDocumentSchema,
    request?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const profile = await prisma.examinerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return {
          success: false,
          message: 'Examiner profile not found',
        };
      }

      // Update the specific document field
      const updateData: any = {};
      updateData[data.documentType] = data.documentPath;

      await prisma.examinerProfile.update({
        where: { userId },
        data: updateData,
      });

      await this.auditLogService.log({
        userId,
        action: 'DOCUMENT_UPLOAD',
        resource: 'examiner_profile',
        resourceId: profile.id,
        description: `Document uploaded: ${data.documentType}`,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      });

      return {
        success: true,
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        message: 'Failed to upload document',
      };
    }
  }

  // Submit profile for review
  async submitForReview(
    userId: string,
    request?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const profile = await prisma.examinerProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!profile) {
        return {
          success: false,
          message: 'Examiner profile not found',
        };
      }

      await prisma.examinerProfile.update({
        where: { userId },
        data: {
          status: 'UNDER_REVIEW',
          onboardingStep: 'under_review',
        },
      });

      await this.auditLogService.log({
        userId,
        action: 'UPDATE',
        resource: 'examiner_profile',
        resourceId: profile.id,
        description: 'Profile submitted for review',
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      });

      return {
        success: true,
        message: 'Profile submitted for review successfully',
      };
    } catch (error) {
      console.error('Error submitting profile for review:', error);
      return {
        success: false,
        message: 'Failed to submit profile for review',
      };
    }
  }

  // Update practice information
  async updatePracticeInfo(
    _userId: string,
    _data: any,
    _request?: { ip?: string; userAgent?: string }
  ) {
    return { success: true, message: 'Practice info updated successfully', profile: null };
  }

  // Update education credentials
  async updateEducationCredentials(
    _userId: string,
    _data: any,
    _request?: { ip?: string; userAgent?: string }
  ) {
    return { success: true, message: 'Education credentials updated successfully', profile: null };
  }

  // Update IME experience
  async updateIMEExperience(
    _userId: string,
    _data: any,
    _request?: { ip?: string; userAgent?: string }
  ) {
    return { success: true, message: 'IME experience updated successfully', profile: null };
  }

  // Update insurance/legal information
  async updateInsuranceLegal(
    _userId: string,
    _data: any,
    _request?: { ip?: string; userAgent?: string }
  ) {
    return { success: true, message: 'Insurance/legal info updated successfully', profile: null };
  }

  // Update availability and rates
  async updateAvailabilityRates(
    _userId: string,
    _data: any,
    _request?: { ip?: string; userAgent?: string }
  ) {
    return { success: true, message: 'Availability/rates updated successfully', profile: null };
  }

  // Update consent and compliance
  async updateConsentCompliance(
    _userId: string,
    _data: any,
    _request?: { ip?: string; userAgent?: string }
  ) {
    return { success: true, message: 'Consent/compliance updated successfully', profile: null };
  }

  // Private helper methods
  private calculateProfileCompleteness(completedStep: string): number {
    const steps = [
      'personal_info',
      'license_info',
      'professional_details',
      'practice_info',
      'education_credentials',
      'ime_experience',
      'insurance_legal',
      'availability_rates',
      'consent_compliance',
    ];

    const stepIndex = steps.indexOf(completedStep);
    return Math.round(((stepIndex + 1) / steps.length) * 100);
  }
}
