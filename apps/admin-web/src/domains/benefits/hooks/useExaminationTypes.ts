import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getExaminationTypesAction } from '../actions';

export type ExaminationTypeOption = {
  label: string;
  value: string;
};

export const useExaminationTypes = (initialExaminationTypeId?: string) => {
  const [examinationTypes, setExaminationTypes] = useState<ExaminationTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExaminationTypes = async () => {
      try {
        const response = await getExaminationTypesAction();
        if (response.success && response.data) {
          setExaminationTypes(response.data);
        } else {
          toast.error('Failed to load examination types');
        }
      } catch {
        toast.error('Failed to load examination types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExaminationTypes();
  }, []);

  return {
    examinationTypes,
    isLoading,
  };
};
