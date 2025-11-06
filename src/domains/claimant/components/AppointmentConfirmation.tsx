'use client';
import React from 'react';
import { ArrowLeft, Star, MapPin, Languages, Car, UserPlus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { SelectedAppointment } from '../types/examinerAvailability';

interface AppointmentConfirmationProps {
  appointment: SelectedAppointment | null;
  claimantName: string;
  onBack?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  appointment,
  claimantName,
  onBack,
  onSubmit,
  isSubmitting = false,
}) => {
  if (!appointment) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-600">No appointment selected.</p>
      </div>
    );
  }

  const formattedDate = format(appointment.date, 'EEEE, MMMM d, yyyy');
  // Show just the hour and AM/PM, e.g., "10 AM"
  const formattedTime = format(appointment.slotStart, 'h a');

  return (
    <div>
      {/* Review Message */}
      <div className="mb-8 bg-[#FAFAFF] pt-8 pb-4 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Review Your Appointment
        </h1>
        <p className="text-lg font-medium text-gray-900">
          Please review your appointment details below and confirm to proceed.
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
            {/* Left Column - Clinic and Specialty */}
            <div className="space-y-3">
              {appointment.clinic && (
                <div className="flex items-start space-x-2">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                  <p className="text-sm font-medium text-gray-900">{appointment.clinic}</p>
                </div>
              )}
              {appointment.specialty && (
                <div className="flex items-start space-x-2">
                  <Star className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                  <p className="text-sm font-medium text-gray-900">{appointment.specialty}</p>
                </div>
              )}
            </div>

            {/* Right Column - Services */}
            <div className="space-y-3 border-t border-purple-100 pt-4">
              <div className="flex items-start space-x-2">
                <Languages className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                <p className="text-sm font-medium text-gray-900">
                  Interpreter:{' '}
                  {appointment.interpreter ? appointment.interpreter.companyName : 'Not Required'}
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Car className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                <p className="text-sm font-medium text-gray-900">
                  Transport:{' '}
                  {appointment.transporter ? appointment.transporter.companyName : 'Not Required'}
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <UserPlus className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#000093]" />
                <p className="text-sm font-medium text-gray-900">
                  Chaperone:{' '}
                  {appointment.chaperone
                    ? `${appointment.chaperone.firstName} ${appointment.chaperone.lastName}`
                    : 'Not Required'}
                </p>
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {/* Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
          )}

          {/* Confirm Button */}
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#000093] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#000080] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
