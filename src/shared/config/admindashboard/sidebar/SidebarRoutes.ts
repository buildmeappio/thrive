/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  LayoutDashboard,
  UserCheck,
  Users,
  UserCog,
  Building2,
  Calendar,
  FileText,
  Receipt,
  FileSearch,
} from 'lucide-react';
import { ISidebarRoutes } from '@/shared/types';
import {Home, Settings, CreditCard, HelpCircle } from 'lucide-react';

export const adminSidebarRoutes: ISidebarRoutes[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin' },
  { icon: UserCheck, label: 'Referrals', href: '/dashboard/admin/referrals' },
  { icon: Users, label: 'Claimants', href: '/dashboard/admin/claimants' },
  { icon: UserCog, label: 'Examiners', href: '/dashboard/admin/examiners' },
  { icon: Building2, label: 'Service Providers', href: '/dashboard/admin/service-providers' },
  { icon: Calendar, label: 'Schedule', href: '/dashboard/admin/schedule' },
  { icon: FileText, label: 'Reports', href: '/dashboard/admin/reports' },
  { icon: Receipt, label: 'Billing & Invoices', href: '/dashboard/admin/billing-invoices' },
  { icon: FileSearch, label: 'Audit Logs', href: '/dashboard/admin/audit-logs' },
];
export const medicalExaminerSidebarRoutes: ISidebarRoutes[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard/medicalExaminer' },
  { icon: FileText, label: 'All Cases', href: '/dashboard/medicalExaminer/cases' },
  { icon: Settings, label: 'Settings', href: '/dashboard/medicalExaminer/settings' },
  { icon: CreditCard, label: 'Billing & Invoices', href: '/dashboard/medicalExaminer/billing' },
  { icon: HelpCircle, label: 'Support & Help', href: '/dashboard/medicalExaminer/support' },
];