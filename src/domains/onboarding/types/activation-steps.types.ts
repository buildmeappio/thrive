import { ProfileData, AvailabilityData, PayoutData } from "@/types/components";

export interface ActivationStepsProps {
  initialActivationStep: string | null;
  examinerProfileId: string | null;
  profileData: ProfileData;
  availabilityData: AvailabilityData;
  payoutData: PayoutData;
  assessmentTypes: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  maxTravelDistances: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
}
