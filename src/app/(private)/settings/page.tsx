import { Metadata } from "next";
import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";
import { getExaminerProfileAction } from "@/domains/setting/server/actions";
import SettingsWrapper from "@/domains/setting/components/settings-wrapper";
import { URLS } from "@/constants/route";
import {
  getAvailabilityAction,
  getPayoutDetailsAction,
} from "@/domains/onboarding/server/actions";
import getAssessmentTypes from "@/domains/auth/actions/getAssessmentTypes";
import getMaxTravelDistances from "@/domains/auth/actions/getMaxTravelDistances";
import { getContractByExaminerProfileIdService } from "@/domains/contract/server/services/getContractByExaminerProfileId.service";
import { getLatestContract } from "@/domains/contract/server/actions/getLatestContract.actions";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Settings | Thrive - Examiner",
  description: "Access your settings to manage your account and preferences",
};

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  // Fetch user
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  // Fetch examiner profile
  const profileResult = await getExaminerProfileAction(user.accountId);

  if (!profileResult.success || !profileResult.data) {
    redirect(URLS.LOGIN);
  }

  const profileData = profileResult.data;

  // Fetch all required data in parallel
  const [
    availabilityResult,
    payoutResult,
    assessmentTypes,
    maxTravelDistances,
    feeStructure,
  ] = await Promise.all([
    getAvailabilityAction({ examinerProfileId: profileData.id }),
    getPayoutDetailsAction({ accountId: user.accountId }),
    getAssessmentTypes(),
    getMaxTravelDistances(),
    // Fetch fee structure
    prisma.examinerFeeStructure.findFirst({
      where: {
        examinerProfileId: profileData.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  // Fetch contract separately to handle both examinerProfileId and applicationId
  const contract = await getContractByExaminerProfileIdService(profileData.id);

  const availability =
    availabilityResult.success && "data" in availabilityResult
      ? availabilityResult.data
      : null;

  const payoutDetails =
    payoutResult.success && "data" in payoutResult ? payoutResult.data : null;

  // Prepare profile data for ProfileInfoForm
  const profileFormData = {
    firstName: profileData.firstName || "",
    lastName: profileData.lastName || "",
    emailAddress: profileData.emailAddress || "",
    professionalTitle: profileData.professionalTitle || "",
    yearsOfExperience: profileData.yearsOfExperience || "",
    clinicName: profileData.clinicName || "",
    clinicAddress: profileData.clinicAddress || "",
    bio: profileData.bio || "",
    profilePhotoId: profileData.profilePhotoId || null,
    profilePhotoUrl: profileData.profilePhotoUrl || null,
  };

  // Prepare services data
  const servicesFormData = {
    assessmentTypes: profileData.assessmentTypes || [],
    acceptVirtualAssessments: profileData.acceptVirtualAssessments ?? true,
    acceptInPersonAssessments: profileData.acceptInPersonAssessments ?? true,
    travelToClaimants: profileData.travelToClaimants ?? false,
    travelRadius: profileData.maxTravelDistance || "",
    assessmentTypeOther: profileData.assessmentTypeOther || "",
  };

  // Prepare availability data
  const availabilityFormData = availability || {};

  // Prepare payout data
  const payoutFormData = payoutDetails || {};

  // Prepare documents data
  const documentsFormData = {
    medicalLicenseDocumentIds: profileData.medicalLicenseDocumentIds || [],
  };

  // Prepare compliance data
  const complianceFormData = {
    phipaCompliance: profileData.phipaCompliance ?? false,
    pipedaCompliance: profileData.pipedaCompliance ?? false,
    medicalLicenseActive: profileData.medicalLicenseActive ?? false,
  };

  // Prepare notifications data
  const notificationsFormData = {
    emailPaymentPayout: profileData.emailPaymentPayout ?? true,
    smsNotifications: profileData.smsNotifications ?? false,
    emailMarketing: profileData.emailMarketing ?? false,
  };

  // Prepare fee structure data
  const feeStructureData = feeStructure
    ? {
        IMEFee: feeStructure.IMEFee?.toString() || null,
        recordReviewFee: feeStructure.recordReviewFee?.toString() || null,
        hourlyRate: feeStructure.hourlyRate?.toString() || null,
        cancellationFee: feeStructure.cancellationFee?.toString() || null,
      }
    : null;

  // Prepare contract data and fetch HTML if contract exists
  let contractData = null;
  let contractHtml: string | null = null;

  if (contract) {
    // Fetch contract HTML from server
    try {
      const contractWithHtml = await getLatestContract(contract.id);
      contractHtml = contractWithHtml?.contractHtml || null;
    } catch (error) {
      console.error("Error fetching contract HTML:", error);
      // Continue without HTML if fetch fails
    }

    contractData = {
      id: contract.id,
      signedPdfS3Key: contract.signedPdfS3Key,
      unsignedPdfS3Key: contract.unsignedPdfS3Key,
      signedHtmlS3Key: contract.signedHtmlS3Key,
      unsignedHtmlS3Key: contract.unsignedHtmlS3Key,
      signedAt: contract.signedAt,
    };
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold text-gray-900 md:text-[34px]">
          Account Settings
        </h1>
      </div>

      <SettingsWrapper
        examinerProfileId={profileData.id}
        userId={user.id}
        profileData={profileFormData}
        servicesData={servicesFormData}
        availabilityData={availabilityFormData}
        payoutData={payoutFormData}
        documentsData={documentsFormData}
        complianceData={complianceFormData}
        notificationsData={notificationsFormData}
        feeStructureData={feeStructureData}
        contractData={contractData}
        contractHtml={contractHtml}
        assessmentTypes={assessmentTypes}
        maxTravelDistances={maxTravelDistances}
      />
    </div>
  );
};

export default SettingsPage;
