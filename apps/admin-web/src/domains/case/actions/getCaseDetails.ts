'use server';
import { getCurrentUser } from '@/domains/auth/server/session';
import handlers from '../server/handlers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const getCaseDetails = cache(async (number: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const caseDetails = await handlers.getCaseById(number, user.id);

  return caseDetails;
});

export default getCaseDetails;
