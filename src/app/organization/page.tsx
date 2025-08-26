import React from 'react';
import { GettingStartedPageClient } from '@/shared/components/gettingStarted/GettingStartedPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started Organization | Thrive',
  description: 'Get Started with Thrive',
};

const Page = async () => {
  return <GettingStartedPageClient userType="organization" />;
};

export default Page;
