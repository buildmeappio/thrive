import { RegisterForm } from "@/domains/auth";
import prisma from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Thrive Examiner",
  description: "Register to your account",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const languages = await prisma.language.findMany();

  return <RegisterForm languages={languages} />;
};

export default Page;
