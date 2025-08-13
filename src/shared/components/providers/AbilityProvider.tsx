'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { User } from '@prisma/client';
import { type AppAbility, defineAbilityFor } from '@/shared/lib/casl/ability';

type Subjects = 'User' | 'Organization' | 'Examination' | 'Document' | 'Report' | any;

interface AbilityContextValue {
  ability: AppAbility;
  can: (action: any, subject: Subjects, field?: string) => boolean;
  cannot: (action: any, subject: Subjects, field?: string) => boolean;
}

const AbilityContext = createContext<AbilityContextValue | undefined>(undefined);

interface AbilityProviderProps {
  children: ReactNode;
}

export function AbilityProvider({ children }: AbilityProviderProps) {
  const { data: session } = useSession();

  // Convert session user to User type for CASL
  const user: User | null = session?.user
    ? ({
        id: session.user.id,
        email: session.user.email,
        username: null,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        preferredLanguage: session.user.preferredLanguage,
        role: session.user.role,
        status: session.user.status,
        permissions: [], // You can add permissions from session if needed
        // Add other required User fields with defaults
        emailVerified: session.user.emailVerified || null,
        emailVerifiedAt: null,
        passwordHash: null,
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        lastLoginIp: null,
        consentGiven: true,
        consentDate: new Date(),
        marketingOptIn: false,
        dataRetention: null,
        privacyPolicyAccepted: true,
        dataRetentionConsent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByIp: null,
        createdBy: null,
        updatedBy: null,
      } as User)
    : null;

  const ability = defineAbilityFor(user);

  const value: AbilityContextValue = {
    ability,
    can: (action: any, subject: Subjects, field?: string) => {
      return ability.can(action, subject, field);
    },
    cannot: (action: any, subject: Subjects, field?: string) => {
      return ability.cannot(action, subject, field);
    },
  };

  return <AbilityContext.Provider value={value}>{children}</AbilityContext.Provider>;
}

export function useAbility(): AbilityContextValue {
  const context = useContext(AbilityContext);

  if (context === undefined) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }

  return context;
}

// Higher-order component for conditional rendering based on permissions
interface CanProps {
  I: any; // action
  a: Subjects; // subject
  field?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ I: action, a: subject, field, children, fallback = null }: CanProps) {
  const { can } = useAbility();

  return can(action, subject, field) ? <>{children}</> : <>{fallback}</>;
}

// Hook for checking permissions in components
export function useCan() {
  const { can, cannot } = useAbility();

  return { can, cannot };
}
