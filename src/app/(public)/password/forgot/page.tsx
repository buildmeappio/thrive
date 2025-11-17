import { Metadata } from "next";
import ForgotPasswordForm from "@/domains/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Thrive - Examiner",
  description: "Reset your password",
};

const ForgotPasswordPage = () => {
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
          <div className="mb-4 flex items-center justify-center text-center">
            <h2 className="text-xl font-semibold">
              Forgot Password
            </h2>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

