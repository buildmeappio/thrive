'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ChaperoneFormPage from '@/domains/services/components/ChaperoneFormPage';
import {
  UpdateChaperoneInput,
  ChaperoneWithAvailability,
} from '@/domains/services/types/Chaperone';

type EditChaperoneClientProps = {
  chaperone: ChaperoneWithAvailability;
  /** Base path for back/redirect (e.g. '/dashboard/chaperones' or tenant '/chaperone'). Default '/dashboard/chaperones'. */
  basePath?: string;
  onUpdate: (id: string, data: UpdateChaperoneInput) => Promise<{ success: boolean }>;
};

const EditChaperoneClient: React.FC<EditChaperoneClientProps> = ({
  chaperone,
  basePath = '/dashboard/chaperones',
  onUpdate,
}) => {
  const router = useRouter();

  const handleSubmit = async (data: UpdateChaperoneInput) => {
    const response = await onUpdate(chaperone.id, data);

    if (response.success) {
      toast.success('Chaperone updated successfully');
      router.push(basePath);
      router.refresh();
    } else {
      throw new Error('Failed to update chaperone');
    }
  };

  return (
    <ChaperoneFormPage
      mode="edit"
      chaperone={chaperone}
      onSubmit={handleSubmit}
      basePath={basePath}
    />
  );
};

export default EditChaperoneClient;
