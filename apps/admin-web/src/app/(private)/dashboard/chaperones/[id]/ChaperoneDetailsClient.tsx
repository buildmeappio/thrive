'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChaperoneWithAvailability } from '@/domains/services/types/Chaperone';
import { deleteChaperone } from '@/domains/services/actions';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ChaperoneDetailsClientProps = {
  chaperone: ChaperoneWithAvailability;
};

const ChaperoneDetailsClient: React.FC<ChaperoneDetailsClientProps> = ({ chaperone }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteChaperone(chaperone.id);

      if (response.success) {
        toast.success('Chaperone deleted successfully');
        router.push('/dashboard/chaperones');
        router.refresh();
      } else {
        throw new Error('Failed to delete chaperone');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete chaperone';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const fullName = `${chaperone.firstName} ${chaperone.lastName}`;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/chaperones"
            className="flex flex-shrink-0 items-center gap-2 sm:gap-4"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
            <h1 className="font-degular text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
              {fullName}
            </h1>
          </Link>

          <div className="flex w-full gap-2 sm:w-auto">
            <Link href={`/dashboard/chaperones/${chaperone.id}/edit`}>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-100 sm:flex-initial sm:px-4 sm:py-2 sm:text-base">
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </Link>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:px-4 sm:py-2 sm:text-base"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="font-poppins text-xl font-semibold text-black">Basic Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div>
                <p className="font-poppins mb-2 text-sm text-gray-500">First Name</p>
                <p className="font-poppins text-base font-medium text-gray-900">
                  {chaperone.firstName}
                </p>
              </div>
              <div>
                <p className="font-poppins mb-2 text-sm text-gray-500">Last Name</p>
                <p className="font-poppins text-base font-medium text-gray-900">
                  {chaperone.lastName}
                </p>
              </div>
              <div>
                <p className="font-poppins mb-2 text-sm text-gray-500">Email</p>
                <p className="font-poppins text-base font-medium text-gray-900">
                  {chaperone.email}
                </p>
              </div>
              <div>
                <p className="font-poppins mb-2 text-sm text-gray-500">Phone</p>
                <p className="font-poppins text-base font-medium text-gray-900">
                  {chaperone.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-poppins mb-2 text-sm text-gray-500">Gender</p>
                <p className="font-poppins text-base font-medium text-gray-900">
                  {chaperone.gender || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-poppins mb-2 text-sm text-gray-500">Date Added</p>
                <p className="font-poppins text-base font-medium text-gray-900">
                  {format(new Date(chaperone.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        {chaperone.availability && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <h2 className="font-poppins text-xl font-semibold text-black">Availability</h2>
            </div>
            <div className="p-6">
              {/* Weekly Hours */}
              {chaperone.availability.weeklyHours &&
                chaperone.availability.weeklyHours.length > 0 && (
                  <div className="mb-8">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#00A8FF] to-[#01F4C8]"></div>
                      <h3 className="font-poppins text-lg font-semibold text-gray-900">
                        Weekly Schedule
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {chaperone.availability.weeklyHours
                        .filter(wh => wh.enabled)
                        .map(wh => (
                          <div
                            key={wh.id || wh.dayOfWeek}
                            className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 transition-shadow hover:shadow-md"
                          >
                            <div className="mb-3 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]"></div>
                              <p className="font-poppins text-base font-semibold text-gray-900">
                                {wh.dayOfWeek.charAt(0) + wh.dayOfWeek.slice(1).toLowerCase()}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {wh.timeSlots.map((slot, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2"
                                >
                                  <svg
                                    className="h-4 w-4 text-[#00A8FF]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <p className="font-poppins text-sm font-medium text-gray-700">
                                    {slot.startTime} - {slot.endTime}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Override Hours */}
              {chaperone.availability.overrideHours &&
                chaperone.availability.overrideHours.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#FF6B6B] to-[#FFA500]"></div>
                      <h3 className="font-poppins text-lg font-semibold text-gray-900">
                        Special Dates
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {chaperone.availability.overrideHours.map(oh => (
                        <div
                          key={oh.id || oh.date}
                          className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50 p-4 transition-shadow hover:shadow-md"
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <svg
                              className="h-5 w-5 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="font-poppins text-base font-semibold text-gray-900">
                              {format(new Date(oh.date), 'EEEE, MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {oh.timeSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2"
                              >
                                <svg
                                  className="h-4 w-4 text-orange-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <p className="font-poppins text-sm font-medium text-gray-700">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {(!chaperone.availability.weeklyHours ||
                chaperone.availability.weeklyHours.filter(wh => wh.enabled).length === 0) &&
                (!chaperone.availability.overrideHours ||
                  chaperone.availability.overrideHours.length === 0) && (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto mb-4 h-16 w-16 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="font-poppins text-lg text-gray-500">No availability set</p>
                    <p className="font-poppins mt-1 text-sm text-gray-400">
                      Schedule has not been configured yet
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the chaperone <strong>{fullName}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChaperoneDetailsClient;
