import React from 'react';
import type { LoginPageProps } from '@/shared/types';
import { LoginPageClient } from '@/shared/components/auth/login/LoginPageClient';

export default async function LoginPage({ params }: LoginPageProps) {
  const { userType } = await params;
  return <LoginPageClient userType={userType} />;
}
