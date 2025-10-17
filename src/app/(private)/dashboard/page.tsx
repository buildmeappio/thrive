import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Thrive - Examiner",
  description:
    "Access your dashboard to manage your account and case examinations",
};

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  return <div className="space-y-4"></div>;
};

export default DashboardPage;
