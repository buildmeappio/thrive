"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ChaperoneWithAvailability } from "@/domains/services/types/Chaperone";
import { deleteChaperone } from "@/domains/services/actions";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ChaperoneDetailsClientProps = {
  chaperone: ChaperoneWithAvailability;
};

const ChaperoneDetailsClient: React.FC<ChaperoneDetailsClientProps> = ({
  chaperone,
}) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteChaperone(chaperone.id);

      if (response.success) {
        toast.success("Chaperone deleted successfully");
        router.push("/dashboard/chaperones");
        router.refresh();
      } else {
        throw new Error("Failed to delete chaperone");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete chaperone";
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
            className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
              {fullName}
            </h1>
          </Link>

          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/dashboard/chaperones/${chaperone.id}/edit`}>
              <button className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors text-sm sm:text-base flex-1 sm:flex-initial">
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </Link>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-initial"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-black font-poppins">
              Basic Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-2">
                  First Name
                </p>
                <p className="text-base text-gray-900 font-poppins font-medium">
                  {chaperone.firstName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-2">
                  Last Name
                </p>
                <p className="text-base text-gray-900 font-poppins font-medium">
                  {chaperone.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-2">Email</p>
                <p className="text-base text-gray-900 font-poppins font-medium">
                  {chaperone.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-2">Phone</p>
                <p className="text-base text-gray-900 font-poppins font-medium">
                  {chaperone.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-2">
                  Gender
                </p>
                <p className="text-base text-gray-900 font-poppins font-medium">
                  {chaperone.gender || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-2">
                  Date Added
                </p>
                <p className="text-base text-gray-900 font-poppins font-medium">
                  {format(new Date(chaperone.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        {chaperone.availability && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-black font-poppins">
                Availability
              </h2>
            </div>
            <div className="p-6">
              {/* Weekly Hours */}
              {chaperone.availability.weeklyHours &&
                chaperone.availability.weeklyHours.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#00A8FF] to-[#01F4C8] rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                        Weekly Schedule
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chaperone.availability.weeklyHours
                        .filter((wh) => wh.enabled)
                        .map((wh) => (
                          <div
                            key={wh.id || wh.dayOfWeek}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full"></div>
                              <p className="font-poppins font-semibold text-gray-900 text-base">
                                {wh.dayOfWeek.charAt(0) +
                                  wh.dayOfWeek.slice(1).toLowerCase()}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {wh.timeSlots.map((slot, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2"
                                >
                                  <svg
                                    className="w-4 h-4 text-[#00A8FF]"
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
                                  <p className="text-sm text-gray-700 font-poppins font-medium">
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
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#FF6B6B] to-[#FFA500] rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                        Special Dates
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {chaperone.availability.overrideHours.map((oh) => (
                        <div
                          key={oh.id || oh.date}
                          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <svg
                              className="w-5 h-5 text-orange-500"
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
                            <p className="font-poppins font-semibold text-gray-900 text-base">
                              {format(new Date(oh.date), "EEEE, MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {oh.timeSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2"
                              >
                                <svg
                                  className="w-4 h-4 text-orange-500"
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
                                <p className="text-sm text-gray-700 font-poppins font-medium">
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
                chaperone.availability.weeklyHours.filter((wh) => wh.enabled)
                  .length === 0) &&
                (!chaperone.availability.overrideHours ||
                  chaperone.availability.overrideHours.length === 0) && (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
                    <p className="text-gray-500 font-poppins text-lg">
                      No availability set
                    </p>
                    <p className="text-gray-400 font-poppins text-sm mt-1">
                      Schedule has not been configured yet
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the chaperone <strong>{fullName}</strong>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChaperoneDetailsClient;
