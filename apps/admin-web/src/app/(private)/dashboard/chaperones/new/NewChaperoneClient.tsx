'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ChaperoneFormPage from '@/domains/services/components/ChaperoneFormPage';
import { createChaperone } from '@/domains/services/actions';
import { CreateChaperoneInput } from '@/domains/services/types/Chaperone';

type NewChaperoneClientProps = {
  /** Base path for redirect after create (e.g. '/dashboard/chaperones' or tenant '/chaperone'). Default '/dashboard/chaperones'. */
  basePath?: string;
  onCreate?: (data: CreateChaperoneInput) => Promise<{ success: boolean }>;
};

const NewChaperoneClient: React.FC<NewChaperoneClientProps> = ({
  basePath = '/dashboard/chaperones',
  onCreate,
}) => {
  const router = useRouter();
  const create = onCreate ?? createChaperone;

  const handleSubmit = async (data: CreateChaperoneInput) => {
    const response = await create(data);

    if (response.success) {
      toast.success('Chaperone created successfully');
      router.push(basePath);
      router.refresh();
    } else {
      throw new Error('Failed to create chaperone');
    }
  };

  return <ChaperoneFormPage mode="create" onSubmit={handleSubmit} basePath={basePath} />;
};

export default NewChaperoneClient;
