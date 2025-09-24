// domains/auth/server/dto/auth.dto.ts
import {
  ExaminerApplication,
  ExaminerApplicationInvite,
  ExaminerProfile,
  Account,
  Role,
  User,
  ExaminerProfileDocument,
  Documents,
} from "@prisma/client";

export type ProfileWithDocs = ExaminerProfile & {
  documents?: (ExaminerProfileDocument & { document: Documents })[];
};

export type ApplicationWithProfile = ExaminerApplication & {
  profile: ProfileWithDocs;
};

export type InviteDto = {
  id: string;
  token: string;
  status: string;
  expiresAt: Date;
  lastOpenedAt: Date | null;
  consumedAt: Date | null;
  createdAt: Date;
};

export type ProfileDto = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  provinceOfResidence: string;
  mailingAddress: string;
  licenseNumber: string;
  provinceOfLicensure: string;
  licenseExpiryDate: Date;
  yearsOfIMEExperience: number;
  forensicAssessmentTrained: boolean;
  experienceDetails: string;
  preferredRegions: string;
  maxTravelDistanceKm: number;
  daysAvailable: string[];
  timeMorning: boolean;
  timeAfternoon: boolean;
  timeEvening: boolean;
  acceptVirtualAssessments: boolean;
  languagesSpoken: string[];
  specialties: string[];
  documents?: {
    id: string;
    type: string;
    linkedAt: Date;
    document: { id: string; name: string; type: string; size: number };
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export type ApplicationDto = {
  id: string;
  status: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedBy: string | null;
  rejectedAt: Date | null;
  rejectedReason: string | null;
  linkedAccountId: string | null;
  profile: ProfileDto;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountWithUser = Account & { role: Role; user: User };

export type AccountDto = {
  id: string;
  role: string;
  isVerified: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
};

class AuthDto {
  static toInviteDto(i: ExaminerApplicationInvite): InviteDto {
    return {
      id: i.id,
      token: i.token,
      status: i.status,
      expiresAt: i.expiresAt,
      lastOpenedAt: i.lastOpenedAt,
      consumedAt: i.consumedAt,
      createdAt: i.createdAt,
    };
  }

  static toProfileDto(p: ProfileWithDocs): ProfileDto {
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      emailAddress: p.emailAddress,
      phoneNumber: p.phoneNumber,
      provinceOfResidence: p.provinceOfResidence,
      mailingAddress: p.mailingAddress,
      licenseNumber: p.licenseNumber,
      provinceOfLicensure: p.provinceOfLicensure,
      licenseExpiryDate: p.licenseExpiryDate,
      yearsOfIMEExperience: p.yearsOfIMEExperience,
      forensicAssessmentTrained: p.forensicAssessmentTrained,
      experienceDetails: p.experienceDetails,
      preferredRegions: p.preferredRegions,
      maxTravelDistanceKm: p.maxTravelDistanceKm,
      daysAvailable: p.daysAvailable as unknown as string[],
      timeMorning: p.timeMorning,
      timeAfternoon: p.timeAfternoon,
      timeEvening: p.timeEvening,
      acceptVirtualAssessments: p.acceptVirtualAssessments,
      languagesSpoken: p.languagesSpoken,
      specialties: p.specialties,
      documents: p.documents?.map((d) => ({
        id: d.id,
        type: d.type,
        linkedAt: d.createdAt,
        document: {
          id: d.document.id,
          name: d.document.name,
          type: d.document.type,
          size: d.document.size,
        },
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  static toApplicationDto(a: ApplicationWithProfile): ApplicationDto {
    return {
      id: a.id,
      status: a.status,
      approvedBy: a.approvedBy,
      approvedAt: a.approvedAt,
      rejectedBy: a.rejectedBy,
      rejectedAt: a.rejectedAt,
      rejectedReason: a.rejectedReason,
      linkedAccountId: a.linkedAccountId,
      profile: this.toProfileDto(a.profile),
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  static toAccountDto(a: AccountWithUser): AccountDto {
    return {
      id: a.id,
      role: a.role.name,
      isVerified: a.isVerified,
      user: {
        id: a.user.id,
        email: a.user.email,
        firstName: a.user.firstName,
        lastName: a.user.lastName,
        phone: a.user.phone,
      },
    };
  }
}

export default AuthDto;
