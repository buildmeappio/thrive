import { ReactNode } from "react";
import { UserRole } from "../user/user";

export interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName?: string;
}
