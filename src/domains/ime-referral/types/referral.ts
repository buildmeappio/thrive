export interface ReferralDetailsData {
  id: string;
  organizationId: string | null;
  claimantId: string;
  consentForSubmission: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  organization: {
    id: string;
    name: string;
    website: string | null;
    isAuthorized: boolean;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    type: {
      id: string;
      name: string;
      description: string | null;
    };
    address: {
      id: string;
      address: string;
      street: string;
      province: string;
      city: string;
      postalCode: string;
      suite: string;
    };
    manager: Array<{
      id: string;
      jobTitle: string | null;
      account: {
        id: string;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string | null;
        };
      };
      department: {
        id: string;
        name: string;
      } | null;
    }>;
  } | null;

  claimant: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    emailAddress: string;
    address: {
      id: string;
      address: string;
      street: string;
      province: string;
      city: string;
      postalCode: string;
      suite: string;
    };
    claimantAvailability: Array<{
      id: string;
      preference: 'IN_PERSON' | 'VIRTUAL' | 'EITHER';
      accessibilityNotes: string | null;
      additionalNotes: string | null;
      consentAck: boolean;
      slots: Array<{
        id: string;
        date: Date;
        startTime: string;
        endTime: string;
        start: Date;
        end: Date;
        timeBand: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'EITHER';
      }>;
      services: Array<{
        id: string;
        type: string;
        enabled: boolean;
        interpreter: {
          id: string;
          language: {
            id: string;
            name: string;
          };
        } | null;
        transport: {
          id: string;
          pickupAddress: {
            id: string;
            address: string;
            street: string;
            city: string;
            province: string;
            postalCode: string;
          } | null;
          rawLookup: string | null;
          notes: string | null;
        } | null;
      }>;
    }>;
  };

  cases: Array<{
    id: string;
    caseNumber: string;
    preferredLocation: string | null;
    urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    assignedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    caseType: {
      id: string;
      name: string;
      description: string | null;
    };

    examFormat: {
      id: string;
      name: string;
      description: string | null;
    };

    requestedSpecialty: {
      id: string;
      name: string;
      description: string | null;
    };

    status: {
      id: string;
      name: string;
      description: string | null;
    };

    examiner: {
      id: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
      };
      role: {
        id: string;
        name: string;
      };
    } | null;

    assignTo: {
      id: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    } | null;

    documents: Array<{
      id: string;
      document: {
        id: string;
        name: string;
        type: string;
        size: number;
        createdAt: Date;
      };
    }>;

    claimantAvailability: Array<{
      id: string;
      preference: 'IN_PERSON' | 'VIRTUAL' | 'EITHER';
      accessibilityNotes: string | null;
      additionalNotes: string | null;
      consentAck: boolean;
      slots: Array<{
        id: string;
        date: Date;
        startTime: string;
        endTime: string;
        timeBand: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'EITHER';
      }>;
    }>;
  }>;
}
