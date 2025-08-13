import React from 'react';
import type { RegisterPageProps } from '@/shared/types';
import { RegisterPageClient } from '@/shared/components/auth/register/RegisterPageClient';

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { userType } = await params;
  return <RegisterPageClient userType={userType} />;
}
