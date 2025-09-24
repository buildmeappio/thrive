'use client';
import { useSession as useNextSession } from 'next-auth/react';
import { Session } from 'next-auth';

export function useSession(): { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' } {
    const { data, status } = useNextSession();
    return { data, status };
}
