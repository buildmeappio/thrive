import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { formatText } from '../../utils';
import type { ExaminerData } from '../../types/ExaminerData';
import type { ExaminerStatus } from '../../types/examinerDetail.types';

interface InterviewDetailsSectionProps {
  examiner: ExaminerData;
  status: ExaminerStatus;
}

export const InterviewDetailsSection = ({ examiner, status }: InterviewDetailsSectionProps) => {
  if (
    !examiner.interviewSlots ||
    examiner.interviewSlots.length === 0 ||
    ![
      'interview_scheduled',
      'interview_completed',
      'contract_sent',
      'contract_signed',
      'approved',
      'active',
    ].includes(status)
  ) {
    return null;
  }

  const bookedSlots = examiner.interviewSlots.filter(
    slot =>
      slot.startTime && slot.endTime && (slot.status === 'BOOKED' || slot.status === 'COMPLETED')
  );

  if (bookedSlots.length === 0) {
    return null;
  }

  return (
    <Section title="Interview Details">
      {bookedSlots.map((slot, index) => (
        <div key={slot.id} className={index > 0 ? 'mt-4' : 'space-y-2'}>
          {index > 0 && <div className="mt-4 border-t border-gray-200 pt-4"></div>}
          <FieldRow
            label={bookedSlots.length > 1 ? `Interview ${index + 1} Date` : 'Interview Date'}
            value={
              slot.startTime
                ? new Date(slot.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A'
            }
            type="text"
          />
          <FieldRow
            label={bookedSlots.length > 1 ? `Interview ${index + 1} Time` : 'Interview Time'}
            value={
              slot.startTime && slot.endTime
                ? `${new Date(slot.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })} - ${new Date(slot.endTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}`
                : 'N/A'
            }
            type="text"
          />
          {slot.status && (
            <FieldRow
              label={bookedSlots.length > 1 ? `Interview ${index + 1} Status` : 'Interview Status'}
              value={formatText(slot.status)}
              type="text"
            />
          )}
        </div>
      ))}
    </Section>
  );
};
