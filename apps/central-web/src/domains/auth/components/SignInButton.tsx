'use client';
import { authClient } from '@/domains/auth/server/better-auth/client';
import { useState } from 'react';

export default function SignInButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    await authClient.signIn.oauth2({
      providerId: 'keycloak',
      callbackURL: '/portal/tenants',
    });
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="bg-linear-to-r flex h-11 w-full items-center justify-center gap-2 rounded-md from-[#00A8FF] to-[#01F4C8] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:h-12"
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Redirecting...
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="M21 2l-9.6 9.6" />
            <path d="M15.5 7.5l3 3L22 7l-3-3" />
          </svg>
          Sign in with Thrive
        </>
      )}
    </button>
  );
}
