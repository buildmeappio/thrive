'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Dropdown from '@/components/Dropdown';
import caseActions from '../actions';
import { CaseStatus } from '../constants/case-status';
import type { CaseStatus as PrismaCaseStatus } from '@thrive/database'; // ← Change to type-only import
import { toast } from 'sonner';
import logger from '@/utils/logger';

type SaveCaseDetailsProps = {
  caseId: string;
  status: string;
  assignTo?: string;
  statusOptions: PrismaCaseStatus[];
};

const SaveCaseDetails = ({ caseId, status, assignTo, statusOptions }: SaveCaseDetailsProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      status: status,
      assignTo: assignTo,
    },
  });

  const onSubmit = async () => {
    try {
      // Check if status changed from "Pending" to "Ready to Appointment"
      if (status === CaseStatus.PENDING && currentStatus === CaseStatus.READY_TO_APPOINTMENT) {
        await caseActions.readyForAppointment(caseId);
      }

      toast.success('Case Status updated successfully!');
      // Add other status update logic here if needed
    } catch (error) {
      toast.error('Error Updating Case Status');
      logger.error('Error updating case status:', error);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
  };

  const transformedStatusOptions = statusOptions.map(option => ({
    value: option.name,
    label: option.name,
  }));

  return (
    <div className="flex h-[80px] w-full items-center gap-2 rounded-full bg-white px-10 shadow-sm">
      <div className="flex items-center gap-2">
        <p className="font-poppins tracking-0 text-[18px] font-semibold leading-none">
          Case Status:
        </p>
        <div className="w-52">
          <Dropdown
            id="case-status"
            label=""
            value={currentStatus}
            onChange={handleStatusChange}
            options={transformedStatusOptions}
            placeholder="Select status"
            className="mb-0"
          />
        </div>
      </div>

      <div className="ml-10 flex items-center gap-2">
        <p className="font-poppins tracking-0 text-[18px] font-semibold leading-none">
          Assigned to:
        </p>
        <p className="font-poppins tracking-0 text-[18px] font-normal leading-none">
          {assignTo || 'Not assigned'}
        </p>
      </div>

      {/* save button on the right */}
      <button
        disabled={isSubmitting}
        className="font-poppins tracking-0 ml-auto cursor-pointer rounded-full bg-[#000093] px-6 py-2.5 text-[18px] font-normal leading-none text-white hover:bg-[#000093]/80 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleSubmit(onSubmit)}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default SaveCaseDetails;
