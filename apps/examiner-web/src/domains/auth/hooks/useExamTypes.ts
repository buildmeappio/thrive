'use client';
import { useState, useEffect } from 'react';
import getExamTypesAction from '@/server/actions/getExamTypes';
import { ExamTypesResponse, ExamType } from '@/server/types/examTypes';

interface ExamTypeOption {
  value: string;
  label: string;
}

/**
 * Hook for fetching exam types from database
 */
export function useExamTypes() {
  const [examTypes, setExamTypes] = useState<ExamTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        setLoading(true);
        const result: ExamTypesResponse = await getExamTypesAction();

        if (result.success) {
          const formattedExamTypes = result.data.map((examType: ExamType) => ({
            value: examType.id,
            label: examType.name,
          }));
          setExamTypes(formattedExamTypes);
        } else {
          console.error('Failed to fetch exam types:', result.message);
          setExamTypes([]);
        }
      } catch (error) {
        console.error('Failed to fetch exam types:', error);
        setExamTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExamTypes();
  }, []);

  return { examTypes, loading };
}
