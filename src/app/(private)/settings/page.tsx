import { Metadata } from "next";
import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";
import { getExaminerProfileAction } from "@/domains/setting/server/actions";
import ProfileInformationSection from "@/domains/setting/components/profile-information-section";
import ChangePasswordSection from "@/domains/setting/components/change-password-section";

export const metadata: Metadata = {
  title: "Settings | Thrive - Examiner",
  description: "Access your settings to manage your account and preferences",
};

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  // Fetch user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/examiner/login");
  }

  // Fetch examiner profile
  const profileResult = await getExaminerProfileAction(user.accountId);

  if (!profileResult.success || !profileResult.data) {
    redirect("/examiner/login");
  }

  const profileData = profileResult.data;

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold text-gray-900 md:text-[34px]">
          Account Settings
        </h1>
      </div>

      <div className="flex flex-col gap-8">
        <ProfileInformationSection
          examinerProfileId={profileData.id}
          initialData={{
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            emailAddress: profileData.emailAddress,
            phoneNumber: profileData.phoneNumber,
            landlineNumber: profileData.landlineNumber || "",
            provinceOfResidence: profileData.provinceOfResidence || "",
            mailingAddress: profileData.mailingAddress || "",
          }}
        />

        <ChangePasswordSection userId={user.id} />
      </div>
    </div>
  );
};

export default SettingsPage;
