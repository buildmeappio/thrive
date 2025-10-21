'use client';
import React from 'react';
import { Check, User, Star, MapPin, HelpCircle, Car, UserPlus } from 'lucide-react';

interface AppointmentConfirmationProps {
  appointment: {
    id: string;
    date: string;
    time: string;
    doctor: {
      name: string;
      specialty: string;
      credentials: string;
    };
    clinic: string;
    requirements: {
      interpreter: string;
      transport: string;
      chaperone: string;
    };
  };
  claimantName: string;
  onBack?: () => void;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  appointment,
  claimantName,
}) => {
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
          {appointment.date} – {appointment.time} at {appointment.clinic}
        </p>
      </div>

      {/* Appointment Details Card */}
      <div className="mx-auto w-full max-w-4xl p-4 sm:px-6">
        <div className="relative mb-8 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-lg">
          {/* Date/Time Label */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E0E0FF] px-4 py-1 text-sm font-medium text-black">
            {appointment.date} – {appointment.time}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Section - Doctor & Clinic Info */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="mt-0.5 h-5 w-5 text-[#000093]" />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{appointment.doctor.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-[#000093]" />
                <p className="font-medium text-gray-900">
                  {appointment.doctor.specialty} | {appointment.doctor.credentials}
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-5 w-5 text-[#000093]" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.clinic}</p>
                </div>
              </div>
            </div>

            {/* Right Section - Requirements */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-[#000093]" />
                <div>
                  <span className="text-sm text-gray-600">Interpreter: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.requirements.interpreter}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Car className="h-5 w-5 text-[#000093]" />
                <div>
                  <span className="text-sm text-gray-600">Transport: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.requirements.transport}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserPlus className="h-5 w-5 text-[#000093]" />
                <div>
                  <span className="text-sm text-gray-600">Chaperone: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.requirements.chaperone}
                  </span>
                </div>
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
