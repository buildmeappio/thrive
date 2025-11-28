"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Dropdown from "@/components/Dropdown";
import caseActions from "../actions";
import { CaseStatus } from "../constants/case-status";
import { CaseStatus as PrismaCaseStatus } from "@prisma/client";
import { toast } from "sonner";
import logger from "@/utils/logger";

type SaveCaseDetailsProps = {
  caseId: string;
  status: string;
  assignTo?: string;
  statusOptions: PrismaCaseStatus[];
};

const SaveCaseDetails = ({ caseId, status, assignTo, statusOptions }: SaveCaseDetailsProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const { handleSubmit, formState: { isSubmitting } } = useForm({
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

      toast.success("Case Status updated successfully!")
      // Add other status update logic here if needed
    } catch (error) {
      toast.error("Error Updating Case Status")
      logger.error("Error updating case status:", error);
    } 
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
  };

  const transformedStatusOptions = statusOptions.map(option => ({
    value: option.name,
    label: option.name
  }));

  return (
    <div className="flex items-center gap-2 shadow-sm w-full bg-white h-[80px] rounded-full px-10 w-full">
      <div className="flex items-center gap-2">
        <p className="font-poppins text-[18px] leading-none tracking-0 font-semibold">
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

      <div className="flex items-center gap-2 ml-10">
        <p className="font-poppins text-[18px] leading-none tracking-0 font-semibold">
          Assigned to:
        </p>
        <p className="font-poppins text-[18px] leading-none tracking-0 font-normal">
          {assignTo || "Not assigned"}
        </p>
      </div>

      {/* save button on the right */}
      <button
          disabled={isSubmitting}
          className="font-poppins text-[18px] bg-[#000093] leading-none tracking-0 font-normal text-white px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#000093]/80 ml-auto disabled:cursor-not-allowed disabled:opacity-50" 
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
  );
};

export default SaveCaseDetails;
