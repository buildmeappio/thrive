'use client';

import React from 'react';
import {
  User,
  Stethoscope,
  Calendar,
  CreditCard,
  FileText,
  Shield,
  Bell,
  Lock,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SettingsStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SETTINGS_STEPS: SettingsStep[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
  },
  {
    id: 'services',
    label: 'Services',
    icon: Stethoscope,
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: Calendar,
  },
  {
    id: 'payout',
    label: 'Payout',
    icon: CreditCard,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: Shield,
  },
  {
    id: 'fee-structure',
    label: 'Fee Structure',
    icon: DollarSign,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    id: 'password',
    label: 'Password',
    icon: Lock,
  },
];

interface SettingsSidebarProps {
  activeStep: string;
  onStepChange: (stepId: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeStep, onStepChange }) => {
  return (
    <div className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:w-auto lg:max-w-[280px]">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Account settings</h2>
      <nav className="space-y-1">
        {SETTINGS_STEPS.map(step => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
                isActive
                  ? 'bg-[#E6F4FF] font-medium text-[#00A8FF]'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon
                className={cn('h-5 w-5 shrink-0', isActive ? 'text-[#00A8FF]' : 'text-gray-500')}
              />
              <span className="text-sm">{step.label}</span>
              {isActive && (
                <div className="absolute bottom-0 right-0 top-0 w-1 rounded-l-lg bg-[#00A8FF]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
