import { RegisterForm } from "@/domains/auth";
import authActions from "@/domains/auth/actions/index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Thrive Examiner",
  description: "Register to your account",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const languages = await authActions.getLanguages();

  return <RegisterForm languages={languages} />;
};

export default Page;
