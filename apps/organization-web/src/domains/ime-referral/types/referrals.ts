import type { Prisma } from '@prisma/client';

export type ReferralDetailsData = Prisma.CaseGetPayload<{
  include: {
    organization: {
      include: {
        type: true;
        address: true;
        manager: {
          include: {
            account: {
              include: {
                user: true;
                role: true;
              };
            };
            department: true;
          };
        };
      };
    };

    documents: {
      include: {
        document: true;
      };
    };
    examinations: {
      include: {
        examinationType: true;
        status: true;
        claimant: {
          include: {
            address: true;
          };
        };
        legalRepresentative: {
          include: {
            address: true;
          };
        };
        insurance: {
          include: {
            address: true;
          };
        };
      };
    };
    examType: true;
  };
}>;
