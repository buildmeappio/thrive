"use client";

import React from "react";
import { User, Stethoscope, Calendar, CreditCard, FileText, Shield, Bell, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SettingsStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SETTINGS_STEPS: SettingsStep[] = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "services",
    label: "Services",
    icon: Stethoscope,
  },
  {
    id: "availability",
    label: "Availability",
    icon: Calendar,
  },
  {
    id: "payout",
    label: "Payout",
    icon: CreditCard,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "password",
    label: "Password",
    icon: Lock,
  },
];

interface SettingsSidebarProps {
  activeStep: string;
  onStepChange: (stepId: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeStep,
  onStepChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 w-full lg:w-auto lg:max-w-[280px] shrink-0">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Account settings</h2>
      <nav className="space-y-1">
        {SETTINGS_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors relative",
                isActive
                  ? "bg-[#E6F4FF] text-[#00A8FF] font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-[#00A8FF]" : "text-gray-500"
                )}
              />
              <span className="text-sm">{step.label}</span>
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00A8FF] rounded-l-lg" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;

