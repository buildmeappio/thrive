import { RegisterPageClient } from '@/shared/components/auth/register/RegisterPageClient';
import type { RegisterPageProps } from '@/shared/types';
import React from 'react';

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { userType } = await params;
  return <RegisterPageClient userType={userType} />;
}
