import React from "react";
import type { LoginPageProps } from "~/types";
import { LoginPageClient } from "~/components/auth/login/LoginPageClient";

export default async function LoginPage({ params }: LoginPageProps) {
  const { userType } = await params;
  return <LoginPageClient userType={userType} />;
}
