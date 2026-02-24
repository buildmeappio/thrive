import Link from 'next/link';
import type { InterviewSlotProps } from '../types/calendar.types';
import { STATUS_COLORS } from '../types/calendar.types';
import { formatTime } from '../utils/calendar';

const InterviewSlot = ({ interview }: InterviewSlotProps) => {
  const statusColors = STATUS_COLORS[interview.status.toLowerCase()] || {
    gradient: 'bg-gray-500',
    text: 'text-white',
    legendColor: 'bg-gray-500',
  };
  const timeRange = `${formatTime(interview.startTime)} - ${formatTime(interview.endTime)}`;

  const content = (
    <div
      className={`group relative mb-1 cursor-pointer rounded-lg p-1.5 transition-all duration-200 sm:mb-2 sm:p-2 ${statusColors.gradient} ${statusColors.text} hover:shadow-lg hover:brightness-110`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="truncate text-[14px] font-medium sm:text-xs">{interview.examinerName}</div>
        <div className="truncate text-[12px] font-medium opacity-90 sm:text-[12px]">
          {timeRange}
        </div>
      </div>
    </div>
  );

  if (interview.applicationId) {
    return <Link href={`/application/${interview.applicationId}`}>{content}</Link>;
  }

  return content;
};

export default InterviewSlot;
