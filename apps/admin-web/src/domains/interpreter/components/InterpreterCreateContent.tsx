'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/layouts/dashboard';
import InterpreterForm from './InterpreterForm';
import { createInterpreter, saveInterpreterAvailabilityAction } from '../actions';
import { toast } from 'sonner';
import { InterpreterFormData, isErrorWithMessage } from '../types/interpreterForm.types';
import logger from '@/utils/logger';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function InterpreterCreateContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: InterpreterFormData) => {
    setIsLoading(true);
    try {
      const result = await createInterpreter({
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone || undefined,
        languageIds: data.languageIds,
      });

      if (!result.success) {
        const errorMessage =
          'message' in result && typeof result.message === 'string'
            ? result.message
            : 'Failed to create interpreter.';
        toast.error(errorMessage);
        return;
      }

      // Save availability after interpreter is created
      if (result.interpreter?.id) {
        await saveInterpreterAvailabilityAction({
          interpreterId: result.interpreter.id,
          weeklyHours: data.weeklyHours,
          overrideHours: data.overrideHours,
        });
      }

      toast.success('Interpreter added successfully!');
      router.push('/interpreter');
    } catch (error) {
      logger.error('Failed to create interpreter:', error);
      if (isErrorWithMessage(error) && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create interpreter. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/interpreter');
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/interpreter" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
            <ChevronLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
          </div>
        </Link>
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Add New{' '}
          <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
            Interpreter
          </span>
        </h1>
      </div>

      <div className="flex w-full flex-col items-center">
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
          <InterpreterForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Interpreter"
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
