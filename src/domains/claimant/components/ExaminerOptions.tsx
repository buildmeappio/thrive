'use client';
import React from 'react';
import { User, MapPin, HelpCircle, Car, UserPlus, ArrowRight, Star } from 'lucide-react';

interface AppointmentOption {
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
}

interface ExaminerOptionsProps {
  onSelectAppointment: (appointmentId: string) => void;
  onBack?: () => void;
}

const ExaminerOptions: React.FC<ExaminerOptionsProps> = ({ onSelectAppointment }) => {
  const appointmentOptions: AppointmentOption[] = [
    {
      id: '1',
      date: 'May 8, 2025',
      time: '9:00 AM',
      doctor: {
        name: 'Dr. Fiona Greene',
        specialty: 'Orthopedic Surgeon',
        credentials: 'FRCSC, CIME',
      },
      clinic: 'Greene Medical Clinic',
      requirements: {
        interpreter: 'Not Required',
        transport: 'FleetX',
        chaperone: 'Not Required',
      },
    },
    {
      id: '2',
      date: 'May 10, 2025',
      time: '11:30 AM',
      doctor: {
        name: 'Dr. Mark Thompson',
        specialty: 'Cardiologist',
        credentials: 'FACC, ABIM',
      },
      clinic: 'Heart Health Institute',
      requirements: {
        interpreter: 'Required',
        transport: 'MedTransit',
        chaperone: 'Required',
      },
    },
    {
      id: '3',
      date: 'May 12, 2025',
      time: '1:00 PM',
      doctor: {
        name: 'Dr. Sarah Lee',
        specialty: 'Pediatrician',
        credentials: 'FAAP',
      },
      clinic: 'Child Wellness Center',
      requirements: {
        interpreter: 'Not Required',
        transport: 'KidCare',
        chaperone: 'Required',
      },
    },
    {
      id: '4',
      date: 'May 15, 2025',
      time: '3:30 PM',
      doctor: {
        name: 'Dr. Samuel Patel',
        specialty: 'Dermatologist',
        credentials: 'AAD',
      },
      clinic: 'Clear Skin Clinic',
      requirements: {
        interpreter: 'Required',
        transport: 'SkinSafe',
        chaperone: 'Not Required',
      },
    },
  ];

  return (
    <div className="mx-auto mb-16 w-full max-w-7xl p-4 sm:px-6">
      <div className="py-8 text-center text-[28px] leading-[100%] font-semibold tracking-normal sm:py-10 sm:text-[32px] md:py-12 md:text-[36px]">
        Choose Your Appointment
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {appointmentOptions.map(appointment => (
          <div
            key={appointment.id}
            className="relative rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl"
          >
            {/* Date/Time Label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E0E0FF] px-4 py-1 text-sm font-medium text-black">
              {appointment.date} - {appointment.time}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Section - Doctor & Clinic Info */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="mt-0.5 h-5 w-5 fill-[#000093] text-[#000093]" />
                  <div>
                    <p className="font-medium text-gray-900">{appointment.doctor.name}</p>
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

            {/* Select Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => onSelectAppointment(appointment.id)}
                className="flex w-1/2 cursor-pointer items-center justify-center space-x-2 rounded-full bg-[#000080] px-4 py-2 font-medium text-white transition-colors duration-200"
              >
                <span>Select This Appointment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExaminerOptions;
