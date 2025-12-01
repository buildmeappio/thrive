import { RegisterForm } from "@/domains/auth";
import authActions from "@/domains/auth/actions/index";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register | Thrive Examiner",
  description: "Register to your account",
};

export const dynamic = "force-dynamic";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;
  const yearsOfExperience = await authActions.getYearsOfExperience();

  // If token exists, fetch examiner data and pass to RegisterForm
  let examinerData = null;
  if (token) {
    try {
      const result = await authActions.getExaminerProfileDetails(token);
      examinerData = result.data;
    } catch (error) {
      console.error("Failed to load examiner data:", error);
      // Redirect to error page or show error message
      redirect("/register?error=invalid_token");
    }
  }

  return (
    <RegisterForm
      yearsOfExperience={yearsOfExperience}
      examinerData={examinerData}
    />
  );
};

export default Page;
