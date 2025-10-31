'use client';
import React from 'react';
import { Check, User, Star } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentConfirmationProps {
  appointment: {
    examinerId: string;
    examinerName: string;
    date: Date;
    slotStart: Date;
    slotEnd: Date;
    specialty?: string;
  } | null;
  claimantName: string;
  onBack?: () => void;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  appointment,
  claimantName,
}) => {
  if (!appointment) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-600">No appointment selected.</p>
      </div>
    );
  }

  const formattedDate = format(appointment.date, 'EEEE, MMMM d, yyyy');
  const formattedTime = `${format(appointment.slotStart, 'h:mm a')} - ${format(appointment.slotEnd, 'h:mm a')}`;

  return (
    <div>
      {/* Success Icon */}
      <div className="flex justify-center bg-[#FAFAFF] pt-4">
        <div className="flex h-18 w-18 items-center justify-center rounded-full bg-[#000093]">
          <Check className="h-16 w-16 text-white" />
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="mb-8 bg-[#FAFAFF] pb-4 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Thank you, {claimantName}.
        </h1>
        <p className="text-lg font-medium text-gray-900">Your appointment has been confirmed.</p>
        <p className="text-lg font-medium text-gray-900">
          {formattedDate} – {formattedTime}
        </p>
      </div>

      {/* Appointment Details Card */}
      <div className="mx-auto w-full max-w-4xl p-4 sm:px-6">
        <div className="relative mb-8 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-lg">
          {/* Date/Time Label */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E0E0FF] px-4 py-1 text-sm font-medium text-black">
            {formattedDate} – {formattedTime}
          </div>

          <div className="space-y-4 pt-4">
            {/* Examiner Info */}
            <div className="flex items-start space-x-3">
              <User className="mt-0.5 h-5 w-5 text-[#000093]" />
              <div>
                <p className="font-medium text-gray-900">{appointment.examinerName}</p>
                {appointment.specialty && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Star className="h-4 w-4 text-[#000093]" />
                    <p className="text-sm text-gray-600">{appointment.specialty}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Instructions</h2>
          <p className="text-gray-700">
            Please bring your government-issued ID. You will receive a reminder 2 days before your
            appointment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
