'use client';

import { useSuspendedCheck } from '@/hooks/useSuspendedCheck';
import { type ReactNode } from 'react';

type SuspendedCheckWrapperProps = {
  children: ReactNode;
};

export function SuspendedCheckWrapper({ children }: SuspendedCheckWrapperProps) {
  useSuspendedCheck(); // Auto-checks and logs out if suspended

  return <>{children}</>;
}
