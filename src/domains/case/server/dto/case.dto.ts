import {
  Examination,
  Organization,
  ExaminationType,
  CaseStatus,
  IMEReferral,
  IMEReferralDocument,
  Claimant,
  Address,
  Account,
  User,
  Documents,
  ExaminationSecureLink,
} from "@prisma/client";

type ReferralDoc = IMEReferralDocument & { document: Documents };

type CaseDetailWithRelations = Examination & {
  referral: IMEReferral & {
    claimant: Claimant & { address?: Address | null };
    organization?: Organization | null;
    documents: ReferralDoc[];
  };
  examinationType: ExaminationType;
  status: CaseStatus;
  assignTo?: (Account & {
    user?: (User & { profilePhoto?: Documents | null }) | null;
  }) | null;
  secureLinks?: ExaminationSecureLink[];
};

type CaseWithRelations = Examination & {
  status: CaseStatus;
  examinationType: ExaminationType;
  assignTo?: (Account & { user: User }) | null;
  referral: IMEReferral & {
    claimant: Claimant;
    organization?: Organization | null;
    documents: ReferralDoc[];
  };
};

class CaseDto {
  static toCaseDto(c: CaseWithRelations) {
    return {
      id: c.id,
      referral: {
        id: c.referral.id,
        number: c.caseNumber,
        documents: c.referral.documents.map(d => ({
          id: d.document.id,
          name: d.document.name,
          type: d.document.type,
          size: d.document.size,
          linkedAt: d.createdAt,
        })),
      },
      claimant: {
        id: c.referral.claimant.id,
        name: `${c.referral.claimant.firstName} ${c.referral.claimant.lastName}`,
        email: c.referral.claimant.emailAddress,
        phone: c.referral.claimant.phoneNumber,
        gender: c.referral.claimant.gender,
        dateOfBirth: c.referral.claimant.dateOfBirth,
      },
      organization: c.referral.organization
        ? {
          id: c.referral.organization.id,
          name: c.referral.organization.name,
          website: c.referral.organization.website,
          status: c.referral.organization.status,
        }
        : null,
      caseType: {
        id: c.examinationType.id,
        name: c.examinationType.name,
      },
      status: {
        id: c.status.id,
        name: c.status.name,
      },
      urgencyLevel: c.urgencyLevel,
      reason: c.reason,
      examinerId: c.examinerId,
      assignTo: c.assignTo
        ? {
          id: c.assignTo.id,
          name: `${c.assignTo.user.firstName} ${c.assignTo.user.lastName}`,
          email: c.assignTo.user.email,
          phone: c.assignTo.user.phone,
          gender: c.assignTo.user.gender,
          dateOfBirth: c.assignTo.user.dateOfBirth,
        }
        : null,
      assignedAt: c.assignedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      deletedAt: c.deletedAt,
    };
  }

  static toCaseDetailDto(c: CaseDetailWithRelations) {
    return {
      id: c.id,
      referral: {
        id: c.referral.id,
        number: c.caseNumber,
        documents: c.referral.documents.map(d => ({
          id: d.document.id,
          name: d.document.name,
          type: d.document.type,
          size: d.document.size,
          linkedAt: d.createdAt,
          // include raw link row id if you need to manage unlinking:
          linkId: d.id,
        })),
      },
      claimant: {
        id: c.referral.claimant.id,
        firstName: c.referral.claimant.firstName,
        lastName: c.referral.claimant.lastName,
        email: c.referral.claimant.emailAddress,
        phone: c.referral.claimant.phoneNumber,
        gender: c.referral.claimant.gender,
        dateOfBirth: c.referral.claimant.dateOfBirth,
        address: c.referral.claimant.address
          ? {
            id: c.referral.claimant.address.id,
            address: c.referral.claimant.address.address,
            street: c.referral.claimant.address.street,
            province: c.referral.claimant.address.province,
            city: c.referral.claimant.address.city,
            postalCode: c.referral.claimant.address.postalCode,
          }
          : null,
      },
      caseType: {
        id: c.examinationType.id,
        name: c.examinationType.name,
      },
      organization: c.referral.organization
        ? {
          id: c.referral.organization.id,
          name: c.referral.organization.name,
          website: c.referral.organization.website,
          status: c.referral.organization.status,
        }
        : null,
      status: {
        id: c.status.id,
        name: c.status.name,
      },
      urgencyLevel: c.urgencyLevel,
      reason: c.reason,
      examinerId: c.examinerId,
      notes: c.notes,
      assignTo:
        c.assignTo && c.assignTo.user
          ? {
            id: c.assignTo.id,
            name: `${c.assignTo.user.firstName} ${c.assignTo.user.lastName}`,
            email: c.assignTo.user.email,
            phone: c.assignTo.user.phone,
            gender: c.assignTo.user.gender,
            dateOfBirth: c.assignTo.user.dateOfBirth,
            profileImage: c.assignTo.user.profilePhoto?.name,
          }
          : null,
      assignedAt: c.assignedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      deletedAt: c.deletedAt,
    };
  }
}

export default CaseDto;
