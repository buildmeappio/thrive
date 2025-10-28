'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import ChaperoneForm from './ChaperoneForm';
import ChaperoneTable from './ChaperoneTable';
import { createChaperone, updateChaperone } from '@/domains/services/actions';
import { Chaperone, ChaperoneData, CreateChaperoneInput, UpdateChaperoneInput } from '../types/Chaperone';
import useRouter from '@/hooks/useRouter';

interface ChaperoneComponentProps {
  chaperones: ChaperoneData[];
  createTrigger?: number; // Add this prop
}

const ChaperoneComponent = ({ chaperones, createTrigger }: ChaperoneComponentProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedChaperone, setSelectedChaperone] = useState<Chaperone | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter(); 

  useEffect(() => {
    if (createTrigger && createTrigger > 0) {
      handleCreate();
    }
  }, [createTrigger]);

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedChaperone(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (chaperone: ChaperoneData) => {
    setDialogMode('edit');
    setSelectedChaperone({
      ...chaperone,
      createdAt: new Date(chaperone.createdAt),
      updatedAt: new Date(),
      deletedAt: null,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: CreateChaperoneInput | UpdateChaperoneInput) => {
    try {
      setIsSubmitting(true);
      
      if (dialogMode === 'create') {
        const response = await createChaperone(data as CreateChaperoneInput);
        if (response.success) {
          toast.success('Chaperone created successfully');
          setIsDialogOpen(false);
          // Trigger a router refresh to refetch data
          router.refresh();
        }
      } else {
        if (!selectedChaperone) return;
        const response = await updateChaperone(selectedChaperone.id, data as UpdateChaperoneInput);
        if (response.success) {
          toast.success('Chaperone updated successfully');
          setIsDialogOpen(false);
          router.refresh();
        }
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${dialogMode} chaperone`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false);
      setSelectedChaperone(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <ChaperoneTable chaperoneList={chaperones} onEdit={handleEdit} onCreate={handleCreate} />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="min-w-[400px] sm:min-w-[500px] lg:min-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Add New Chaperone' : 'Edit Chaperone'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'Fill in the details to add a new chaperone to the system.'
                : 'Update the chaperone information below.'}
            </DialogDescription>
          </DialogHeader>
          <ChaperoneForm
            mode={dialogMode}
            chaperone={selectedChaperone}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChaperoneComponent;