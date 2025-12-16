import { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetPasswordForm } from "@/domains/auth";

export const metadata: Metadata = {
  title: "Reset Password | Thrive - Examiner",
  description: "Create your new password",
};

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  const { token } = await searchParams;

  // Validate token exists
  if (!token) {
    redirect("/examiner/login?error=invalid_token");
  }

  return <PasswordResetUI token={token} />;
};

const PasswordResetUI = ({ token }: { token: string }) => (
  <div className="bg-[#F4FBFF] h-[calc(100vh-120px)] overflow-hidden">
    <div className="mx-auto h-full max-w-[900px] p-6 flex flex-col justify-center">
      {/* Header */}
      <div className="mt-8 mb-4 flex h-[60px] items-center justify-center text-center md:mt-0 md:h-[60px]">
        <h2 className="text-[25px] font-semibold whitespace-nowrap md:text-[40px]">
          Reset Your Password
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
          <SetPasswordForm token={token} isPasswordReset={true} />
        </div>
      </div>
    </div>
  </div>
);

export default ResetPasswordPage;
