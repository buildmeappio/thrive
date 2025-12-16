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
  ] = await Promise.all([
    getAvailabilityAction({ examinerProfileId: profileData.id }),
    getPayoutDetailsAction({ accountId: user.accountId }),
    getAssessmentTypes(),
    getMaxTravelDistances(),
  ]);

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
    acceptInPersonAssessments: true, // Default to true
    travelToClaimants: !!profileData.maxTravelDistance,
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
        assessmentTypes={assessmentTypes}
        maxTravelDistances={maxTravelDistances}
      />
    </div>
  );
};

export default SettingsPage;
