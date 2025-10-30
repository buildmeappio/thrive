'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ChaperoneFormPage from '@/domains/services/components/ChaperoneFormPage';
import { createChaperone } from '@/domains/services/actions';
import { CreateChaperoneInput } from '@/domains/services/types/Chaperone';

const NewChaperoneClient: React.FC = () => {
  const router = useRouter();

  const handleSubmit = async (data: CreateChaperoneInput) => {
    const response = await createChaperone(data);
    
    if (response.success) {
      toast.success('Chaperone created successfully');
      router.push('/dashboard/chaperones');
      router.refresh();
    } else {
      throw new Error('Failed to create chaperone');
    }
  };

  return <ChaperoneFormPage mode="create" onSubmit={handleSubmit} />;
};

export default NewChaperoneClient;

