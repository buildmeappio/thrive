import { Metadata } from "next";
import { Header } from "@/domains/dashboard";
import { ActivationSteps } from "@/domains/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Thrive - Examiner",
  description: "Access your dashboard to manage your account and examinations",
};

const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <Header />
      <ActivationSteps />
    </div>
  );
};

export default DashboardPage;
