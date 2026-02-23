'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { cancelBooking, getBookingDetails } from '@/domains/claimant/actions/cancelBooking';
import env from '@/config/env';

function CancelBookingContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{
    id: string;
    caseNumber: string;
    examinationType: string;
    bookingDate: string;
    examinerName: string;
  } | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const token = searchParams.get('token');
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (!token || !bookingId) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }

    // Fetch booking details
    getBookingDetails(token, bookingId).then(result => {
      if (result.success && result.booking) {
        setBookingDetails(result.booking);
      } else {
        setError(result.message);
      }
      setLoading(false);
    });
  }, [token, bookingId]);

  const handleCancel = async () => {
    if (!token || !bookingId) return;

    setCancelling(true);
    setError(null);

    const result = await cancelBooking(token, bookingId);

    if (result.success) {
      setCancelled(true);
    } else {
      setError(result.message);
    }
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Booking Cancelled</h2>
            <p className="mb-6 text-gray-600">
              Your booking has been successfully cancelled. The examiner has been notified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Error</h2>
            <p className="mb-6 text-gray-600">{error || 'Failed to load booking details'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Image
            src={`${env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
            alt="Thrive Logo"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Cancel Booking</h2>
          <p className="text-gray-600">Are you sure you want to cancel this booking?</p>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Case Number</p>
              <p className="text-base font-semibold text-gray-900">{bookingDetails.caseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Examination Type</p>
              <p className="text-base font-semibold text-gray-900">
                {bookingDetails.examinationType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Booking Date & Time</p>
              <p className="text-base font-semibold text-gray-900">{bookingDetails.bookingDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Examiner</p>
              <p className="text-base font-semibold text-gray-900">{bookingDetails.examinerName}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <svg
              className="mr-2 h-5 w-5 shrink-0 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-yellow-800">
              This action cannot be undone. The examiner will be notified of the cancellation.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full rounded-md bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CancelBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CancelBookingContent />
    </Suspense>
  );
}
