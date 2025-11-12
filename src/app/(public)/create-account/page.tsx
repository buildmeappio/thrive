// app/create-account/page.tsx
import { SetPasswordForm } from "@/domains/auth";
import { redirect } from "next/navigation";
import authActions from "@/domains/auth/actions";
import ErrorMessages from "@/constants/ErrorMessages";
import { Metadata } from "next";
import { getExaminerProfileByAccountId } from "@/domains/contract/server/actions/getExaminerProfileByAccountId.actions";
import { getContractByExaminerProfileId } from "@/domains/contract/server/actions/getContractByExaminerProfileId.actions";
import { getAccountById } from "@/domains/contract/server/actions/getAccountById.actions";
import { markContractAsViewed } from "@/domains/contract/server/actions/markContractAsViewed.actions";
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Create Account | Thrive Examiner",
  description: "Create your account",
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  const { token } = await searchParams;

  // Step 1: Validate token exists
  if (!token) {
    redirect("/create-account/success?error=invalid_token");
  }

  let accountId: string;

  // Step 2: Verify token and extract account data
  try {
    const tokenData = await authActions.verifyAccountToken({ token });
    accountId = tokenData.data.user.accountId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "unknown";

    if (errorMessage.includes(ErrorMessages.USER_NOT_FOUND)) {
      redirect("/create-account/success?error=user_not_found");
    }

    if (errorMessage.includes("already been used")) {
      redirect("/create-account/success?error=token_used");
    }

    redirect("/create-account/success?error=invalid_token");
  }

  // Step 3: Get examiner profile using server action
  const examinerProfile = await getExaminerProfileByAccountId(accountId);

  // Step 4: Get latest contract if profile exists
  let latestContract = null;
  if (examinerProfile) {
    latestContract = await getContractByExaminerProfileId(examinerProfile.id);
  }

  if(!latestContract){
    redirect("/create-account/success?error=no_contract_found");
  } 

  // Step 5: Handle case when examiner profile doesn't exist
  if (!examinerProfile) {
    const account = await getAccountById(accountId);

    // If account exists and needs password, show password setup
    if (account && !account.user.password) {
      return <PasswordSetupUI token={token} />;
    }

    // Otherwise, profile not found error
    redirect("/create-account/success?error=profile_not_found");
  }

  const hasPassword = examinerProfile.account.user.password !== null;

  // Step 6: Check if account is already fully set up
  if (
    latestContract?.status === "SIGNED" &&
    examinerProfile.status === "ACTIVE" &&
    hasPassword
  ) {
    redirect("/create-account/success?error=account_already_created");
  }

  // Step 7: Check if contract needs to be viewed
  if (
    latestContract &&
    (latestContract.status === "SENT" || latestContract.status === "VIEWED")
  ) {
    // Mark contract as viewed if status is SENT
    if (latestContract.status === "SENT") {
      await markContractAsViewed(latestContract.id, accountId);
    }

    // Redirect to contract page
    redirect(`/contract/${latestContract.id}?token=${token}`);
  }

  // Step 8: Default - show password setup
  return <PasswordSetupUI token={token} />;
};

const PasswordSetupUI = ({ token }: { token: string }) => (
  <div className="bg-[#F4FBFF]">
    <div className="mx-auto min-h-screen max-w-[900px] p-6">
      {/* Header */}
      <div className="mt-8 mb-4 flex h-[60px] items-center justify-center text-center md:mt-0 md:h-[60px]">
        <h2 className="text-[25px] font-semibold whitespace-nowrap md:text-[40px]">
          Create Your Password
        </h2>
      </div>

      {/* Form Container */}
      <div
        className="min-h-[350px] rounded-[20px] bg-white px-1 py-5 md:min-h-[400px] md:px-[50px] md:py-0"
        style={{
          boxShadow: "0px 0px 36.35px 0px #00000008",
        }}
      >
        <div className="-mb-6 pt-1 pb-1 md:mb-0">
          <SetPasswordForm token={token} />
        </div>
      </div>
    </div>
  </div>
);

export default Page;
