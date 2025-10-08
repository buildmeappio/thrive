
import { Address } from "@prisma/client";

export type CaseDetailDtoType = {
    id: string;
    caseNumber: string;
    urgencyLevel: string;
    supportPerson: boolean,
    dueDate: Date,
    notes: string,
    additionalNotes: string,
    createdAt: Date,
    assignedAt: Date,
    status: {
        id: string,
        name: string,
    };
    examinationType: {
        id: string;
        name: string;
        shortForm: string | null;
    };
    examiner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    services: Array<{
        type: string;
        enabled: boolean;
        interpreter: {
            languageId: string;
            languageName: string;
        } | null;
        transport: {
            address: string;
            street: string | null;
            province: string | null;
            city: string | null;
            notes: string | null;
        } | null;
    }>;
    case: {
        id: string;
        caseType: {
            id: string;
            name: string;
        };
        reason: string | null;
        consentForSubmission: boolean;
        isDraft: boolean;
        documents: Array<{
            id: string;
            name: string;
            type: string;
            size: number;
        }>;
        claimant: {
            id: string;
            firstName: string;
            lastName: string;
            emailAddress: string | null;
            phoneNumber: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            address: Address | null;
            relatedCases: string | null;
        };
        familyDoctor: {
            name: string | null;
            email: string | null;
            phoneNumber: string | null;
            faxNumber: string | null;

        };
        organization: {
            id: string;
            name: string;
            website: string | null;
            status: string;
        };
        legalRepresentative: {
            id: string;
            companyName: string | null;
            contactPersonName: string | null;
            phoneNumber: string | null;
            faxNumber: string | null;
            address: Address | null;

        };

        insurance: {
            id: string;
            emailAddress: string;
            companyName: string;
            contactPersonName: string;
            policyNumber: string;
            claimNumber: string;
            dateOfLoss: Date;
            policyHolderIsClaimant: boolean;
            policyHolderFirstName: string;
            policyHolderLastName: string;
            phoneNumber: string;
            faxNumber: string;
            addressId: string | null;
            address: Address | null;
        };

    };
};
