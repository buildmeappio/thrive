import OrganizationDashboard from "@/shared/components/Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Dashboard | Thrive',
  description: 'Manage your organization on Thrive',
};

const DashboardPage = () => {

  return (
    <OrganizationDashboard />
  );
}
export default DashboardPage;