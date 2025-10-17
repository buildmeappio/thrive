import { SetPasswordForm } from "@/domains/auth";
import { redirect } from "next/navigation";
import authActions from "@/domains/auth/actions";
import ErrorMessages from "@/constants/ErrorMessages";
import { Metadata } from "next";

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

  try {
    // Verify token and check user exists
    await authActions.verifyAccountToken({ token });
  } catch (error) {
    // Redirect to error page based on error type
    const errorMessage = error instanceof Error ? error.message : "unknown";

    if (errorMessage.includes(ErrorMessages.USER_NOT_FOUND)) {
      redirect("/create-account/success?error=user_not_found");
    }

    redirect("/create-account/success?error=invalid_token");
  }
  return (
    <div className="bg-[#F4FBFF]">
      <div className="mx-auto min-h-screen max-w-[900px] p-6">
        <div className="mt-8 mb-4 flex h-[60px] items-center justify-center text-center md:mt-0 md:h-[60px]">
          <h2 className="text-[25px] font-semibold whitespace-nowrap md:text-[40px]">
            Create Your Password
          </h2>
        </div>

        <div
          className="min-h-[350px] rounded-[20px] bg-white px-1 py-5 md:min-h-[400px] md:px-[50px] md:py-0"
          style={{
            boxShadow: "0px 0px 36.35px 0px #00000008",
          }}>
          <div className="-mb-6 pt-1 pb-1 md:mb-0">
            {<SetPasswordForm token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
