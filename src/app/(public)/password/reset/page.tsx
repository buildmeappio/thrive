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

  return (
    <div className="bg-[#F4FBFF] h-screen flex items-center justify-center p-4" style={{ overflow: 'hidden' }}>
      <div className="max-w-[600px] w-full">
        {/* Form Container */}
        <div
          className="rounded-[20px] bg-white px-8 py-8 md:px-12 md:py-10"
          style={{
            boxShadow: "0px 0px 36.35px 0px #00000008",
          }}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-center text-center">
            <h2 className="text-2xl font-semibold">
              Reset Your Password
            </h2>
          </div>
          <SetPasswordForm token={token} isPasswordReset={true} />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

