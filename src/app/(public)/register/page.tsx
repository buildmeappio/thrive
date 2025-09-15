import { RegisterForm } from "@/domains/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: 'Register | Thrive Examiner',
	description: 'Register to your account',
};

const Page = () => {
	return <RegisterForm />
}

export default Page;