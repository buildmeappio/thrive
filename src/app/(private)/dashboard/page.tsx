import { Metadata } from "next";
import { Header } from "@/domains/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Thrive - Examiner",
  description: "Access your dashboard to manage your account and examinations",
};

const DashboardPage = () => {
  return <Header />;
};

export default DashboardPage;
